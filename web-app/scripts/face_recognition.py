#!/usr/bin/python

import cv2
import os
import pathlib
import argparse
import json

def setup():
  arg_parser = argparse.ArgumentParser(
    prog = 'Face Recognition',
    description = 'Ejecuta el reconocimiento facial.',
    epilog = 'Ubiquitous Computing')
  
  arg_parser.add_argument('imagepath',
    help='Ruta a la imagen a identificar.')
  
  args = arg_parser.parse_args()
  return args

def main():
  # Get arguments
  args = setup()
  # Vars
  imagepath = args.imagepath
  dataPath = pathlib.Path(pathlib.Path(__file__).parent, 'data')
  #fileName = pathlib.Path('Ale', 'face_1.jpg')
  imagePaths = os.listdir(dataPath)
  faceRecognizer = cv2.face.EigenFaceRecognizer_create()
  model_path = pathlib.Path(pathlib.Path(__file__).parent, 'TeLaReconozco.xml')
  faceRecognizer.read(str(model_path))
  faceClassifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

  # Script
  # frame = cv2.imread(str(pathlib.Path(dataPath, fileName)), cv2.IMREAD_GRAYSCALE)
  frame = cv2.imread(imagepath, cv2.IMREAD_GRAYSCALE)
  gray = frame
  auxFrame = gray.copy()
  faces = faceClassifier.detectMultiScale(gray, 1.3, 5)

  face_detected = False
  for (x, y, w, h) in faces:
    face_detected = True
    face = auxFrame[y:y + h, x:x + w]
    face = cv2.resize(face, (150, 150), interpolation=cv2.INTER_CUBIC)
    result = faceRecognizer.predict(face)
    if result[1] < 12000:
      res = {
        'faceIdentified': True,
        'person': imagePaths[result[0]],
        'message': 'Ok'
      }
      print(json.dumps(res))
    else:
      res = {
        'faceIdentified': False,
        'person': 'Desconocido',
        'message': 'Ok'
      }
      print(json.dumps(res))
  if not face_detected:
    res = {
      'faceIdentified': False,
      'person': 'Desconocido',
      'message': 'No se pudieron detectar rostros en la imagen'
    }
    print(json.dumps(res))

if __name__ == '__main__':
  main()
