def plsdothis():
    from twilio.rest import Client

    # Twilio configuration
    TWILIO_ACCOUNT_SID = "ACb4a42cfac2e29688c9842e78d748baa2"
    TWILIO_AUTH_TOKEN = "9f04333434376820bdb6edd429339c30"
    TWILIO_FROM_NUMBER = "+18144822566"
    TARGET_NUMBER = "+916366226413"

    # Text message
    TEXT_MESSAGE = "Alert! Pranav has left the safe zone! Please rectify the issue. Call Pranav at 9880946661 for communication"

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