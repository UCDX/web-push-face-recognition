import os
import pathlib
import cv2
import imutils

while True:
    print('Nombre:', end=' ')
    name = input()
    dataPath = pathlib.Path(pathlib.Path(__file__).parent, 'data')
    personPath = pathlib.Path(dataPath, name)

    if not os.path.exists(personPath):
        os.makedirs(personPath)
        print("Se creó el directorio: ", personPath)

    cap = cv2.VideoCapture(0)
    faceClassifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    count = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame = imutils.resize(frame, width=640)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        auxFrame = frame.copy()
        faces = faceClassifier.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            face = auxFrame[y:y + h, x:x + w]
            face = cv2.resize(face, (150, 150), interpolation=cv2.INTER_CUBIC)
            cv2.imwrite(str(pathlib.Path(personPath, f'face_{count}.jpg')), face)
            count = count + 1

        cv2.imshow("frame", frame)
        k = cv2.waitKey(1)

        if k == 27 or count >= 500:
            break

    cap.release()
    cv2.destroyAllWindows()
    print('Desea grabar a otra persona?(s/n)', end=' ')
    response = input()

    if response != 's':
        break
