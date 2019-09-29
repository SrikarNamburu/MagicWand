
import time
import requests 
from pynput.keyboard import Key, Controller
import pandas as pd
from keras.models import load_model
from scipy.stats.stats import pearsonr
import pickle

sensorsModel = pickle.load(open('Gesture_Classifier_Model.pkl','rb'))


def dataPrep(gestureData):
    
    temp = gestureData
    acc_x_mean,acc_y_mean,acc_z_mean,gyro_x_mean,gyro_y_mean,gyro_z_mean = temp.mean()
    acc_x_max, acc_y_max, acc_z_max, gyro_x_max,gyro_y_max, gyro_z_max= temp.max()
    acc_x_min,acc_y_min,acc_z_min,gyro_x_min,gyro_y_min,gyro_z_min = temp.min()
    acc_x_mad, acc_y_mad,acc_z_mad, gyro_x_mad, gyro_y_mad, gyro_z_mad = temp.mad()
    acc_x_std,acc_y_std,acc_z_std,gyro_x_std,gyro_y_std,gyro_z_std = temp.std()

    acc_x_y_corr,_ = pearsonr(temp.ax,temp.ay)
    acc_z_x_corr,_= pearsonr(temp.az,temp.ax)
    acc_y_z_corr,_ =pearsonr(temp.ay,temp.az)

    gyro_x_y_corr,_  =pearsonr(temp.gx,temp.gy)
    gyro_z_x_corr,_ =pearsonr(temp.gz,temp.gx)
    gyro_y_z_corr,_ =pearsonr(temp.gy,temp.gz)

    gestureDataList = list([acc_x_mean, acc_y_mean, acc_z_mean, gyro_x_mean, gyro_y_mean, gyro_z_mean, acc_x_max, acc_y_max, acc_z_max, gyro_x_max,gyro_y_max, gyro_z_max, acc_x_min, acc_y_min, acc_z_min,gyro_x_min, gyro_y_min, gyro_z_min, acc_x_mad, acc_y_mad,acc_z_mad, gyro_x_mad, gyro_y_mad, gyro_z_mad, acc_x_std,acc_y_std, acc_z_std, gyro_x_std, gyro_y_std, gyro_z_std,acc_x_y_corr, acc_y_z_corr, acc_z_x_corr, gyro_x_y_corr,gyro_y_z_corr, gyro_z_x_corr])

    gestureDataFrame = pd.DataFrame(gestureDataList).T
    gestureDataFrame.columns = ['acc_x_mean','acc_y_mean','acc_z_mean','gyro_x_mean','gyro_y_mean','gyro_z_mean','acc_x_max','acc_y_max','acc_z_max','gyro_x_max','gyro_y_max','gyro_z_max','acc_x_min','acc_y_min','acc_z_min','gyro_x_min','gyro_y_min','gyro_z_min','acc_x_mad','acc_y_mad','acc_z_mad','gyro_x_mad','gyro_y_mad','gyro_z_mad','acc_x_std','acc_y_std','acc_z_std','gyro_x_std','gyro_y_std','gyro_z_std','acc_x_y_corr','acc_y_z_corr','acc_z_x_corr','gyro_x_y_corr','gyro_y_z_corr','gyro_z_x_corr']
    
    test = gestureDataFrame.as_matrix()
    result = sensorsModel.predict(test).argmax()
    return result

# api-endpoint 
URL = "http://localhost:4500/getNewAction"
keyboard = Controller()
  
while(True):
    r = requests.get(url = URL) 
    data = r.json() 
    if (data != False and bool(data['gyroscope'] == True)):
        formattedData = pd.concat([pd.DataFrame(data['accelerometer']),pd.DataFrame(data['gyroscope'])],axis=1)
        formattedData = formattedData.dropna(axis=0, how='any')
        formattedData.columns = ["ax", "ay", "az", "gx", "gy", "gz"]
        # formattedData.to_csv('formattedData.csv')
        formattedData = formattedData.dropna(axis=0, how='any')
        # formattedData.to_csv('formattedData_afterDrop.csv')
        result = dataPrep(formattedData)
        print(result)
        if result == 0:
            keyboard.press(Key.right)
            time.sleep(0.1)
            keyboard.release(Key.right)
        if result == 1:
            keyboard.press(Key.left)
            time.sleep(0.1)
            keyboard.release(Key.left)
