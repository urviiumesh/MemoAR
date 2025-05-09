import speech_recognition as sr
import pyttsx3
import google.generativeai as genai
import time


genai.configure(api_key="AIzaSyCsvVpJ_bKPgEWqjd3Sf4EaMlM7w9p46ZA")
model = genai.GenerativeModel('gemini-1.5-flash') 

# Initialize speech components
engine = pyttsx3.init()
recognizer = sr.Recognizer()

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
conversation_history = ["""
    Answer each question within 50 words. Here is a conversation history use it for context.
    Keep in mind that you are speaking to a patient with dementia, so keep things simple:\n"""]

def speak(text):
    #converting text to speech here
    engine.say(text)
    engine.runAndWait()

def listen():
    """Listen to microphone input and convert to text"""
    with sr.Microphone() as source:
        print("\nListening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source, timeout=5)
        
    try:
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError:
        return "API unavailable"

def conversation_loop():
    #Main conversation loop
    speak("Hello! I'm your AI assistant. How can I help you today?")
    a = 0
    while True:
        user_input = listen()
        print(f"You: {user_input}")
        
        if "exit" == user_input.lower():
            speak("Goodbye! Have a great day.")
            break
            
        try:
            response = AI(user_input)
            ai_response = response.text
            print(f"AI: {ai_response}")
            conversation_history.append(f"\nrole: assistant\ncontent: {ai_response}")
            speak(ai_response)
        except Exception as e:
            print(f"Error: {str(e)}")
            speak("Sorry, I encountered an error. Please try again.")
            a = a+1
            if (a == 3):
                break

if __name__ == "__main__":
    try:
        conversation_loop()
    except KeyboardInterrupt:
        speak("Goodbye!")
    finally:
        # Clean up pyttsx3 engine
        engine.stop()