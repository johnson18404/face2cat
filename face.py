import cv2
import sys
import os

# Get user supplied values
imagePath = sys.argv[1]
# cascPath = sys.argv[2]
cascPath = 'haarcascade_frontalface_alt.xml'

catdir = os.path.join(os.getcwd(), 'public', 'img')
catnum = sys.argv[2]

savePath = sys.argv[3]

# Create the haar cascade
faceCascade = cv2.CascadeClassifier(cascPath)

# Read the image
image = cv2.imread(imagePath)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


# Detect faces in the image
faces = faceCascade.detectMultiScale(
    gray,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(30, 30),
    flags = cv2.cv.CV_HAAR_SCALE_IMAGE
)

# print "Found {0} faces!".format(len(faces))

if len(faces)==0:
    raise Exception("Error: face not found.")

# print os.path.join(catdir, 'c'+catnum+'.jpg')

catimg = cv2.imread(os.path.join(catdir, 'c'+catnum+'.jpg'))
cat_height, cat_width, cat_channels = catimg.shape
# print cat_height, cat_width, cat_channels

# Draw a rectangle around the faces
for (x, y, w, h) in faces:
    # cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

    
    cat_tmp = cv2.resize(catimg, (w, w*cat_height/cat_width)) 
    th, tw, tc = cat_tmp.shape
    image[y:y+th, x:x+tw, :] = cat_tmp
   

# cv2.imshow("Faces found" ,image)
# cv2.waitKey(0)

cv2.imwrite(savePath, image)