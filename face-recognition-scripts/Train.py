import os
import pathlib
import cv2
import numpy as np

dataPath = pathlib.Path(pathlib.Path(__file__).parent, 'data')
folders = os.listdir(dataPath)
labels = []
facesData = []
label = 0

for folder in folders:
    personPath = pathlib.Path(dataPath, folder)

    for fileName in os.listdir(personPath):
        labels.append(label)
        facesData.append(cv2.imread(str(pathlib.Path(personPath, fileName)), 0))
        image = cv2.imread(str(pathlib.Path(personPath, fileName)), 0)
        cv2.imshow('image', image)
        cv2.waitKey(10)

    label = label + 1

cv2.destroyAllWindows()
faceRecognizer = cv2.face.EigenFaceRecognizer_create()
print("Entrenando porque ella me rompió el corazón...")
faceRecognizer.train(facesData, np.array(labels))
faceRecognizer.write('TeLaReconozco.xml')
print("Modelo almacenado y mamadisimo")
