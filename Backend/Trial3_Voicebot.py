conversation_history = ["""
        You are an AI assistant for a person with Dementia. Your name is JAIN HACKATHON AI.
        Give this if asked: The patient's details are:- Name - Pranav ; Age - 78 ; Son - Vidit ; Emergency contact : 9880946661 - Son.
        Keep in mind that you are speaking to a patient with dementia, so keep things simple.
        Just continue your part of the conversation. You will have the latest prompt asked.
        If the user is in Panic, talk in a sympathetic tone.
        Do not use any formatting or asterisks. speak as if you are speaking like a human.
        Answer each question within 50 words. Here is a conversation history use it for context. 
        History:\n"""]
def d0():
    import speech_recognition as sr
    from elevenlabs import generate, save
    import google.generativeai as genai
    import time
    import os
    import tempfile
    import subprocess
    import sounddevice as sd  # New for audio analysis
    import numpy as np        # New for audio processing

    # Configure APIs
    genai.configure(api_key="AIzaSyCsvVpJ_bKPgEWqjd3Sf4EaMlM7w9p46ZA")
    model = genai.GenerativeModel('gemini-1.5-flash') 
    ELEVENLABS_API_KEY = "sk_6765f3629bd6adc443110f6fbab56a3e34feb2825dee8062"

    # Audio configuration
    SAMPLE_RATE = 48000  # Increased from default 16000
    CHUNK_SIZE = 2048     # Larger chunk size for better processing

    # Initialize components
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True  # Auto-adjust for ambient noise
    recognizer.pause_threshold = 1.5           # Longer pause before considering speech ended

    def AI(message):
        global conversation_history
        conversation_history.append(f"role: user\ncontent: {message}")
        entry = ""
        for i in conversation_history:
            entry+=i
        response = model.generate_content(
            conversation_history,
            stream=True
        )
        for chunk in response:  
            print(chunk.text, end='', flush=True)
        return response
    
    def is_speaking(audio_data, threshold=0.02):  # Lower threshold
        audio_np = np.frombuffer(audio_data.get_raw_data(), dtype=np.int16)
        if len(audio_np) == 0:
            return False
            
        # Normalize audio data
        audio_float = audio_np.astype(np.float32) / 32768.0
        
        # Calculate RMS with noise floor adjustment
        rms = np.sqrt(np.mean(np.square(audio_float)))
        noise_floor = np.percentile(np.abs(audio_float), 30)
        return (rms - noise_floor) > threshold
    def speak(text):
        """Convert text to speech using ElevenLabs and play with mpv"""
        try:
            # Generate audio
            audio = generate(
                api_key=ELEVENLABS_API_KEY,
                text=text,
                voice="Rachel",
                model="eleven_monolingual_v1"
            )
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                save(audio, temp_file.name)
                
                # Get the path to mpv.exe - using absolute path
                mpv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Backend', 'mpv', 'mpv.exe')
                
                # Verify mpv exists
                if not os.path.exists(mpv_path):
                    raise FileNotFoundError(f"mpv.exe not found at: {mpv_path}")
                
                # Play audio using mpv
                subprocess.run([mpv_path, temp_file.name], 
                            stdout=subprocess.DEVNULL, 
                            stderr=subprocess.DEVNULL)
                
                # Clean up the temporary file
                os.unlink(temp_file.name)
                
        except Exception as e:
            print(f"Error in speech synthesis: {str(e)}")
            print(f"Current working directory: {os.getcwd()}")
            print(f"Attempted mpv path: {mpv_path}")


    def listen():
        """Faster voice activity detection with optimized timeouts"""
        with sr.Microphone(sample_rate=SAMPLE_RATE) as source:
            print("\nListening... (Speak now)")
            
            # Faster ambient noise adjustment
            recognizer.adjust_for_ambient_noise(source, duration=0.3)
            
            audio_buffer = []
            start_time = time.time()
            timeout = 10  # Reduced from 10 to 5 seconds max
            silent_chunks = 0
            max_silent_chunks = 3  # Number of silent chunks needed to stop
            
            while time.time() - start_time < timeout:
                try:
                    # Smaller listening window
                    audio_chunk = recognizer.listen(source, timeout=0.5, phrase_time_limit=3)
                    audio_buffer.append(audio_chunk)
                    
                    # Voice activity check
                    if is_speaking(audio_chunk):
                        silent_chunks = 0
                    else:
                        silent_chunks += 1
                        
                    # Stop if 2 consecutive silent chunks detected after initial speech
                    if silent_chunks >= max_silent_chunks and len(audio_buffer) > 2:
                        break
                        
                except sr.WaitTimeoutError:
                    if len(audio_buffer) > 0:  # If we have some audio, process it
                        break
                    continue
            print('.', end='', flush=True)  # Show listening progress
            # Process audio if any captured
            if len(audio_buffer) == 0:
                return "Could not understand audio"
                
            audio = sr.AudioData(b''.join([chunk.get_raw_data() for chunk in audio_buffer]), 
                            source.SAMPLE_RATE, 
                            source.SAMPLE_WIDTH)
            
            try:
                return recognizer.recognize_google(audio, language="en-US")
            except Exception as e:
                return "Could not understand audio"
    def conversation_loop():
        speak("Hello! I'm your AI assistant. How can I help you today?")
        error_count = 0
        
        while True:
            user_input = listen()
            print(f"You: {user_input}")
            
            if "exit" in user_input.lower():
                speak("Goodbye! Have a great day.")
                break
                
            try:
                response = AI(user_input)
                ai_response = response.text
                print(f"AI: {ai_response}")
                conversation_history.append(f"\nrole: assistant\ncontent: {ai_response}")
                speak(ai_response)
                error_count = 0  # Reset error counter on success
            except Exception as e:
                print(f"Error: {str(e)}")
                error_count += 1
                if error_count >= 3:
                    speak("Too many errors. Shutting down.")
                    break

    try:
        conversation_loop()
    except KeyboardInterrupt:
        speak("Goodbye!")
