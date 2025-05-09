"""from twilio.rest import Client
from elevenlabs import generate, save
import os

# Authorization
TWILIO_ACCOUNT_SID = "ACb4a42cfac2e29688c9842e78d748baa2"
TWILIO_AUTH_TOKEN = "9f04333434376820bdb6edd429339c30"
TWILIO_FROM_NUMBER = "+18144822566"
TARGET_NUMBER = "+916366226413"
ELEVEN_API_KEY = "sk_6765f3629bd6adc443110f6fbab56a3e34feb2825dee8062"
'''
# 1. Generate and save audio locally
TEXT_MESSAGE = "Remember to buy a birthday cake for your son today."
try:
    audio = generate(
        api_key=ELEVEN_API_KEY,
        text=TEXT_MESSAGE,
        voice="Rachel",
        model="eleven_monolingual_v1"
    )
    save(audio, "message.mp3")
except Exception as e:
    print(f"Audio generation failed: {e}")
    exit()
'''
# 2. Use local file path directly (Twilio will host temporarily)
try:
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    # Upload media to Twilio's CDN
    media_url = f"file://{os.path.abspath('message.mp3')}"
    
    call = client.calls.create(
        to=TARGET_NUMBER,
        from_=TWILIO_FROM_NUMBER,
        twiml=f'<Response><Play>{media_url}</Play></Response>'
    )
    print(f"Call initiated! SID: {call.sid}")

except Exception as e:
    print(f"Call failed: {e}")"""

def dothis(desc,title,time):
    from twilio.rest import Client

    # Twilio configuration
    TWILIO_ACCOUNT_SID = "ACb4a42cfac2e29688c9842e78d748baa2"
    TWILIO_AUTH_TOKEN = "9f04333434376820bdb6edd429339c30"
    TWILIO_FROM_NUMBER = "+18144822566"
    TARGET_NUMBER = "+916366226413"

    # Text message
    TEXT_MESSAGE = f"Dont forget about your Reminder! Title: {title}. {desc}. at.  {time}"

    # Create Twilio client
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try:
        # Create call with direct text-to-speech
        call = client.calls.create(
            to=TARGET_NUMBER,
            from_=TWILIO_FROM_NUMBER,
            twiml=f'<Response><Say voice="Polly.Amy-Neural">{TEXT_MESSAGE}</Say></Response>'
        )
        print(f"Call initiated! SID: {call.sid}")
        print(f"Call status: {call.status}")

    except Exception as e:
        print(f"Call failed: {str(e)}")