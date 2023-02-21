import cv2
import os
import pathlib
import argparse

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
  faceRecognizer.read('TeLaReconozco.xml')
  faceClassifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

  # Script
  # frame = cv2.imread(str(pathlib.Path(dataPath, fileName)), cv2.IMREAD_GRAYSCALE)
  frame = cv2.imread(imagepath, cv2.IMREAD_GRAYSCALE)
  gray = frame
  auxFrame = gray.copy()
  faces = faceClassifier.detectMultiScale(gray, 1.3, 5)

  for (x, y, w, h) in faces:
    face = auxFrame[y:y + h, x:x + w]
    face = cv2.resize(face, (150, 150), interpolation=cv2.INTER_CUBIC)
    result = faceRecognizer.predict(face)
    if result[1] < 12000:
      print(imagePaths[result[0]])
    else:
      print('Desconocido')

if __name__ == '__main__':
  main()
