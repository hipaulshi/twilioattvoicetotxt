#Twilioattvoicetotxt
This is just proof of concept app. There's still bugs in the program. Not sure if it my implementation issue. But may be so that twilio will issue call back to /action before the record is ready. As a result, the actual downloading voice file and transfer to att engine is done on the ```speechToText``` part. which takes about 10 sec to load depending on the length of the speech.

#Setup
```bash
mv credentials.js.sample credentials.js
```

then filling your api credentials
on twilio admin page, change voice call back address to 
```
http://yourhostaddress:3000/twilio
```
do ```npm install``` after check out.

#Usage

call your twilio phone number and speak the command, after you are done, press the ```#``` key.
then go to

```
http://yourhostaddress:3000/speechToText
```
wait for the page to load and see the result