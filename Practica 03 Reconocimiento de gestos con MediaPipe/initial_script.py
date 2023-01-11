import cv2
import mediapipe as mp

mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_hands = mp.solutions.hands

cap = cv2.VideoCapture(0)
with mp_hands.Hands(
    model_complexity=0,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as hands:
  while cap.isOpened():
    success, image = cap.read()
    if not success:
      print("Ignoring empty camera frame.")
      # If loading a video, use 'break' instead of 'continue'.
      continue

    # Flip the image horizontally for a selfie-view display.
    image = cv2.flip(image, 1)

    # To improve performance, optionally mark the image as not writeable to
    # pass by reference.
    image.flags.writeable = False
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image)

    # Draw the hand annotations on the image.
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


    if results.multi_hand_landmarks:
      for hand_landmarks in results.multi_hand_landmarks:
        mp_drawing.draw_landmarks(
            image,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_drawing_styles.get_default_hand_landmarks_style(),
            mp_drawing_styles.get_default_hand_connections_style())

      #----------------
      # Detect fingers
      #----------------

      # list of finger tips locators, 4 is thumb, 20 is pinky finger
      tipIds = [4, 8, 12, 16, 20]

      lm = hand_landmarks.landmark

      # x,y coordinates of pinky tip. Coordinates are normalized to [0.0,1.0] with width and height of the image
      lm[tipIds[4]].x
      lm[tipIds[4]].y

      #height, width and depth (RGB=3) of image
      (h,w,d) = image.shape

    # CONTAR LOS DEDOS LEVANTADOS
      fingers = 0 
      fingers_aux = 0
      for i in range(0,5):
        if i==0: 
          if lm[tipIds[i]].x < lm[tipIds[i]-1].x:
            fingers += 1
            fingers_aux += 1
        else:
          if lm[tipIds[i]].y < lm[tipIds[i]-1].y:
            fingers += 1
            fingers_aux += 1
      cv2.putText(image, str(fingers), (550,60),cv2.FONT_HERSHEY_SIMPLEX,2,(255,0,0), thickness = 5)

    # ACTIVATE LIKE OR DISLIKE
      if (fingers_aux == 1): # 1 finger up (like)
        if lm[tipIds[0]].y < lm[tipIds[1]].y and lm[tipIds[1]].y < lm[tipIds[2]].y and lm[tipIds[2]].y < lm[tipIds[3]].y and lm[tipIds[3]].y < lm[tipIds[4]].y:
          cv2.putText(image, "Like", (20,60),cv2.FONT_HERSHEY_SIMPLEX,2,(255,0,0), thickness = 5)

      if (fingers_aux == 1): # 1 finger up (dislike)
        if lm[tipIds[0]].y > lm[tipIds[1]].y and lm[tipIds[1]].y > lm[tipIds[2]].y and lm[tipIds[2]].y > lm[tipIds[3]].y and lm[tipIds[3]].y > lm[tipIds[4]].y:
          cv2.putText(image, "Dislike", (20,60),cv2.FONT_HERSHEY_SIMPLEX,2,(255,0,0), thickness = 5)

    # ACTIVATE PEACE GESTURE
      if (fingers_aux == 2): # 2 fingers up
        if (lm[8].y < lm[6].y) and (lm[12].y < lm[10].y) and (abs(lm[12].x-lm[8].x) >= 0.08):
          cv2.putText(image, "Peace", (20,60),cv2.FONT_HERSHEY_SIMPLEX,2,(255,0,0), thickness = 5)

    # ACTIVATE SPIDERMAN GESTURE
      if (fingers_aux == 3): # 3 fingers up
        if (lm[16].y < lm[12].y) and (lm[20].y < lm[16].y) and (abs(lm[20].x-lm[16].x) >= 0.08):
          cv2.putText(image, "Spiderman", (20,60),cv2.FONT_HERSHEY_SIMPLEX,2,(255,0,0), thickness = 5)

    # ACTIVATE OK GESTURE
      if (fingers_aux == 4): # 4 fingers up
        if (lm[16].y < lm[12].y) and (lm[20].y < lm[16].y) and (abs(lm[20].x-lm[16].x) >= 0.08):
          cv2.putText(image, "Piola", (20,60),cv2.FONT_HERSHEY_SIMPLEX,2,(255,0,0), thickness = 5)

    cv2.imshow('MediaPipe Hands', image) # show image

    if cv2.waitKey(5) & 0xFF == 27: # ESC
      break

cap.release()