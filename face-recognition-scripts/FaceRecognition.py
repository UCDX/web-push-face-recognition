import cv2
import os
import pathlib

dataPath = pathlib.Path(pathlib.Path(__file__).parent, 'data')
imagePaths = os.listdir(dataPath)
faceRecognizer = cv2.face.EigenFaceRecognizer_create()
faceRecognizer.read('TeLaReconozco.xml')
capture = cv2.VideoCapture(0)
faceClassifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

while capture.isOpened:
    ret, frame = capture.read()

    if not ret:
        break

    #frame = cv2.flip(frame, 1)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    auxFrame = gray.copy()
    faces = faceClassifier.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        face = auxFrame[y:y + h, x:x + w]
        face = cv2.resize(face, (150, 150), interpolation=cv2.INTER_CUBIC)
        result = faceRecognizer.predict(face)
        cv2.putText(frame, '{}'.format(result), (x, y - 5), 1, 1.3, (255, 255, 0), 1, cv2.LINE_AA)

        if result[1] < 12000:
            cv2.putText(frame, '{}'.format(imagePaths[result[0]]), (x, y - 25), 2, 1.1, (0, 255, 0), 1, cv2.LINE_AA)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        else:
            cv2.putText(frame, 'Desconocido', (x, y - 20), 2, 0.8, (0, 0, 255), 1, cv2.LINE_AA)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

    cv2.imshow('frame', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

capture.release()
cv2.destroyAllWindows()
