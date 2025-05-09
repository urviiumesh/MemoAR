import os
import asyncio
from dotenv import load_dotenv
from livekit import api
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,
    JobProcess,
    AutoSubscribe,
    metrics,
)
from livekit.agents.llm import (
    ChatContext,
    ChatMessage,
    FunctionContext,
    ai_callable,
)
from livekit.agents import llm
from Scraper import run_search_query
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import silero, groq, elevenlabs, google
from typing import Annotated
import json


load_dotenv()

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

# Modify the AssistantFnc to support background music publication.
class AssistantFnc(llm.FunctionContext):
    @llm.ai_callable()
    async def get_information_from_web(
        self, 
        query: Annotated[
            str, 
            llm.TypeInfo(description="This is the users query that you are going to web search, make it as short and concise as possible so google can process it and give best results")
        ]
    ):
        """Called when the user asks about any query that would require a web search."""
        # Assume that you store a reference to your JobContext in a global variable or
        # pass it in some other way. For demonstration, let's say it's stored in self.ctx.
        # (You might need to modify your code so that the context is accessible here.)
        if not hasattr(self, "ctx"):
            raise Exception("Livekit context not assigned to AssistantFnc")
        
        res = await asyncio.to_thread(run_search_query, query)
        
        print("fetched", res)
        return f"result of search for query {query} is {res}"

# Ensure that the AssistantFnc can access the JobContext. One way is to assign it right in entrypoint.
fnc_ctx = AssistantFnc()

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Make the context available to our function context.
    fnc_ctx.ctx = ctx

    # Outbound calling integration:
    metadata_obj = json.loads(ctx.job.metadata)
    phone_number = metadata_obj.get("phone")
    state_modifier = metadata_obj.get("state_modifier")
    participant = None

    if phone_number:
        user_identity = "phone_user"
        outbound_trunk_id = os.getenv("OUTBOUND_TRUNK_ID")  # Set in your environment variables
        print(f"Dialing {phone_number} to room {ctx.room.name}")
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=outbound_trunk_id,
                sip_call_to=phone_number,
                participant_identity=user_identity,
            )
        )
        participant = await ctx.wait_for_participant(identity=user_identity)
    else:
        await ctx.wait_for_participant()

    initial_ctx = ChatContext(
        messages=[
            ChatMessage(
                role="system",
                content=(
                    state_modifier
                ),
            )
        ]
    )

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=groq.STT(),
        llm=google.LLM(api_key="AIzaSyBKwSsqBxUBEZ8KuFidD7EMATDslUgoKzs"),
        tts=elevenlabs.tts.TTS(
            model="eleven_turbo_v2_5",
            voice=elevenlabs.tts.Voice(
                id="bajNon13EdhNMndG3z05",
                name="Viraj",
                category="premade",
                settings=elevenlabs.tts.VoiceSettings(
                    stability=0.71,
                    similarity_boost=0.5,
                    style=0.0,
                    use_speaker_boost=True
                ),
            ),
            language="en",
            streaming_latency=3,
            enable_ssml_parsing=False,
            chunk_length_schedule=[80, 120, 200, 260],
        ),
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx,
    )

    @agent.on("metrics_collected")
    def _on_metrics_collected(mtrcs: metrics.AgentMetrics):
        metrics.log_metrics(mtrcs)

    if participant:
        agent.start(ctx.room, participant)
    else:
        agent.start(ctx.room)

    await agent.say("Hello, To speak in English say English, Hindi me baat karne ke liye hindi bolein", allow_interruptions=False)

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            agent_name="groq-agent",
        )
    )