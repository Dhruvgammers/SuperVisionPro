document.addEventListener('DOMContentLoaded', async () => {
    const chatIdInput = document.getElementById('chatId');
    const cooldownPeriodInput = document.getElementById('cooldownPeriod');
    const mainSection = document.getElementById('main-section');
    const video = document.getElementById('video');
    let TELEGRAM_CHAT_ID = localStorage.getItem('telegramChatId') || '';
    let COOLDOWN_PERIOD = parseInt(localStorage.getItem('cooldownPeriod')) || 5000; // Default to 5000ms
    let currentCamera = 'user'; // Default cam  era value

    // Set the initial values of the input fields
    chatIdInput.value = TELEGRAM_CHAT_ID;
    cooldownPeriodInput.value = COOLDOWN_PERIOD;

    mainSection.style.display = "none";

    async function startVideo() {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // 'environment' for back camera, 'user' for front camera
                }
            });
    
            video.srcObject = videoStream;

            // Handle camera access permission explicitly
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            if (permissionStatus.state === 'prompt') {
                await permissionStatus.userChoice;
            }

            video.addEventListener('play', () => {
                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                faceapi.matchDimensions(canvas, displaySize);

                canvas.addEventListener('click', event => handleCanvasClick(event));

                document.getElementById('main-section').style.display = 'block';

                setInterval(async () => {
                    // Check if the video element is valid
                    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
                        const detections = await faceapi.detectAllFaces(video, faceDetectionOptions)
                            .withFaceLandmarks()
                            .withFaceDescriptors()
                            .withFaceExpressions();

                        // Check if detections is a valid array
                        if (Array.isArray(detections) && detections.length > 0) {
                            detectedFaces = detections;

                            const resizedDetections = faceapi.resizeResults(detections, displaySize);
                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                            faceapi.draw.drawDetections(canvas, resizedDetections);
                            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

                            for (const detectedFace of detectedFaces) {
                                captureFace(detectedFace);
                            }
                        } 
                    } else {
                        console.error('Invalid video element or dimensions');
                    }
                }, 100);
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }

    function stopVideo() {
        // Hide the #main section
        document.getElementById('main-section').style.display = 'none';

        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        video.pause();
        clearInterval(videoIntervalId); // Stop the interval for face detection
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }

    async function startDetection() {
        const chatId = chatIdInput.value.trim();
        const cooldownPeriod = parseInt(cooldownPeriodInput.value.trim());
        mainSection.style.display = 'block';

        if (chatId) {
            // Save chat ID and cooldown period to localStorage
            localStorage.setItem('telegramChatId', chatId);
            localStorage.setItem('cooldownPeriod', cooldownPeriod);

            // Update the TELEGRAM_CHAT_ID and COOLDOWN_PERIOD variables
            TELEGRAM_CHAT_ID = chatId;
            COOLDOWN_PERIOD = cooldownPeriod;

            // Inform the user that settings are saved (you can customize this part)
            alert('Telegram settings saved successfully!');

            // Start video and face detection
            await startVideo();

            // Start the interval for face detection
            videoIntervalId = setInterval(detectFaces, 100);
        } else {
            alert('Please enter Chat ID.');
        }
    }

    function stopDetection() {
        stopVideo();
        // Add any additional cleanup logic if needed
        mainSection.style.display = 'none';
    }
  
    function stopVideo() {
        // Hide the #main section
        document.getElementById('main-section').style.display = 'none';

        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        video.pause();
        clearInterval(videoIntervalId); // Stop the interval for face detection
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }

    async function startDetection() {
        const chatId = chatIdInput.value.trim();
        const cooldownPeriod = parseInt(cooldownPeriodInput.value.trim());
        mainSection.style.display = 'block';

        if (chatId) {
            // Save chat ID and cooldown period to localStorage
            localStorage.setItem('telegramChatId', chatId);
            localStorage.setItem('cooldownPeriod', cooldownPeriod);

            // Update the TELEGRAM_CHAT_ID and COOLDOWN_PERIOD variables
            TELEGRAM_CHAT_ID = chatId;
            COOLDOWN_PERIOD = cooldownPeriod;

            // Inform the user that settings are saved (you can customize this part)
            alert('Telegram settings saved successfully!');

            // Start video and face detection
            await startVideo();

            // Start the interval for face detection
            videoIntervalId = setInterval(detectFaces, 100);
        } else {
            alert('Please enter Chat ID.');
        }
    }

    function stopDetection() {
        stopVideo();
        // Add any additional cleanup logic if needed
        mainSection.style.display = 'none';
        
    }

    function flipCamera() {
        // Stop the current stream
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());

        // Switch the camera
        currentCamera = currentCamera === 'user' ? 'environment' : 'user';

        // Initialize the new camera stream
        startVideo();
    }

    const canvas = document.getElementById('canvas');
    const faceDetectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416, // Adjust the inputSize based on your needs
    });
    let detectedFaces = [];
    const capturedFaceIds = new Set();
    const TELEGRAM_BOT_TOKEN = '6944550729:AAGaRaOnQNOpdxp4hihE-4sM5twcSejFwIM';
    let lastCaptureTime = 0;

    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ]);

    async function detectFaces() {
        try {
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);
    
            const detections = await faceapi.detectAllFaces(video, faceDetectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptors()
                .withFaceExpressions();
    
            if (Array.isArray(detections) && detections.length > 0) {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
                // Log the detections to check their structure
                console.log('Face Detections:', detections);
    
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    
                for (const detectedFace of detectedFaces) {
                    captureFace(detectedFace);
                }
            } 
        } catch (error) {
            console.error('Error in detectFaces:', error);
        }
    }
    

    function handleCanvasClick(event) {
        // You can add code here to perform actions on canvas click
    }
    

    function captureFace(detectedFace) {
        const currentTime = Date.now();
        const faceId = detectedFace.descriptor.toString();

        // Check if the face has already been captured and if cooldown period has passed
        if (!capturedFaceIds.has(faceId) && (currentTime - lastCaptureTime) >= COOLDOWN_PERIOD) {
            const faceCanvas = document.createElement('canvas');
            faceCanvas.width = detectedFace.detection.box.width;
            faceCanvas.height = detectedFace.detection.box.height;
            const ctx = faceCanvas.getContext('2d');
            ctx.drawImage(video, detectedFace.detection.box.x, detectedFace.detection.box.y, detectedFace.detection.box.width, detectedFace.detection.box.height, 0, 0, detectedFace.detection.box.width, detectedFace.detection.box.height);

            // Add a unique identifier to the captured image
            const uniqueNumber = Date.now(); // You can use a more sophisticated method for generating unique IDs
            const uniqueId = `face_${uniqueNumber}`;

            // Add the face ID to the set to prevent capturing it again
            capturedFaceIds.add(faceId);

            // Update last capture time
            lastCaptureTime = currentTime;

            // Send the captured image to Telegram
            sendImageToTelegram(faceCanvas.toDataURL('image/png'));
        } else {
            // Face already captured or cooldown period not passed, you can add additional logic or feedback here
            console.log('');
        }
    }

    async function sendImageToTelegram(imageDataURL) {
        const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        try {
            // Convert base64 data URL to a Blob
            const blob = await fetch(imageDataURL).then(response => response.blob());

            // Create a FormData object
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('photo', blob, 'photo.png'); // 'photo.png' is a filename, you can adjust it

            // Send the FormData using fetch with 'POST' method
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Telegram API response:', data);
        } catch (error) {
            console.error('Error sending image to Telegram:', error);
        }
    }

    window.startDetection = startDetection; // Expose startDetection function for button click
    window.stopDetection = stopDetection; // Expose stopDetection function for button click
    window.flipCamera = flipCamera;
});