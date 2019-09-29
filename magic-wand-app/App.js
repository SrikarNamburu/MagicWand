import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Gyroscope } from 'expo-sensors';

export default class AccelerometerSensor extends React.Component {
  state = {
    accelerometerData: {},
    accelerometerObject: {},
    isAccelerometerObjectInitialized: false,
    gyroscopeData: {},
    gyroscopeObject: {},
    isGyroscopeObjectInitialized: false,
    isIPAddressOk : false,
    ipAddress : '',
    buttonText: 'Connect to a server to start!'
  };

  componentDidMount() {
    Accelerometer.setUpdateInterval(10);
    Gyroscope.setUpdateInterval(10);
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _handlePressIn = () => {
    this._subscribe();
  };

  _handlePressOut = () => {
    this._unsubscribe();
  };
  

  _checkIPaddress = async (ip) => {
    console.log('Checking IP address...')
    let aliveUrl = ''
    if(ip[ip.length - 1] == '/') {
      aliveUrl = ip + 'alive'
    } else {
      aliveUrl = ip + '/alive'
    }
    fetch(aliveUrl)
    .then((response) => {
      if (response.status === 200) {
        console.log('success');
        console.log('Checking if server is live : '+aliveUrl)
        this.setState({ 
          isIPAddressOk: true,
          buttonText: 'Click on the button, Do the Gesture, Release the button'
        });
      } else {
        console.log('error');
      }
    })
    .catch((error) => {
      this.setState({ 
        isIPAddressOk: false,
        buttonText: 'Connect to a server to start!'
      });
      console.log('oops! network error: ' + error);
     })
     console.log('Requests sent to : ' + ip)
      this.setState({ 
        ipAddress: ip,
      });
  }

  _sendDataToServer = async () => {
    console.log(this.state.ipAddress)
    let allValuesObject = {}
    allValuesObject['accelerometer'] = this.state.accelerometerObject
    allValuesObject['gyroscope'] = this.state.gyroscopeObject
    console.log('Sending values to server...')
    console.log(allValuesObject)
    var response = await fetch(this.state.ipAddress, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allValuesObject)
    })
  } 

  _subscribe = () => {
    this._accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
      let { x, y, z } = accelerometerData

      let accelerometerObject = this.state.accelerometerObject

      if(!this.state.isAccelerometerObjectInitialized) {
        accelerometerObject['x'] = []
        accelerometerObject['y'] = []
        accelerometerObject['z'] = []
      }
      accelerometerObject['x'].push(x)
      accelerometerObject['y'].push(y)
      accelerometerObject['z'].push(z)

      this.setState({ 
        accelerometerData: accelerometerData,
        accelerometerObject: accelerometerObject,
        isAccelerometerObjectInitialized: true
      });
    });

    this._gyroscopeSubscription = Gyroscope.addListener(gyroscopeData => {
      let { x, y, z } = gyroscopeData

      let gyroscopeObject = this.state.gyroscopeObject

      if(!this.state.isGyroscopeObjectInitialized) {
        gyroscopeObject['x'] = []
        gyroscopeObject['y'] = []
        gyroscopeObject['z'] = []
      }
      gyroscopeObject['x'].push(x)
      gyroscopeObject['y'].push(y)
      gyroscopeObject['z'].push(z)

      this.setState({ 
        gyroscopeData: gyroscopeData,
        gyroscopeObject: gyroscopeObject,
        isGyroscopeObjectInitialized: true
      });
    });
  };

  _unsubscribe = async () => {
    this._accelerometerSubscription && this._accelerometerSubscription.remove();
    this._accelerometerSubscription = null;
    this._gyroscopeSubscription && this._gyroscopeSubscription.remove();
    this._gyroscopeSubscription = null;
    await this._sendDataToServer()
    this.setState({
      accelerometerObject: {},
      isAccelerometerObjectInitialized: false,
      gyroscopeObject: {},
      isGyroscopeObjectInitialized: false,
    })
  };

  render() {
    return (
      <View style={styles.sensor}>
        <Text style={{ fontSize: 20}}>
          Magic Wand
        </Text>
        <TextInput 
          style={{height: 40, 
            width:"100%", 
            borderColor: 'black', 
            borderWidth: 1, 
            margin:5,
            padding: 5
          }}
          type='text'
          defaultValue = 'http://'
          placeholder='Enter IP address'
          onSubmitEditing = {(data) => this._checkIPaddress(data.nativeEvent.text)}
        />
        <View style={{ height: "75%", width: "100%"}}>
          <TouchableOpacity disabled = {!this.state.isIPAddressOk} onPressIn={this._handlePressIn} onPressOut={this._handlePressOut} style={styles.button}>
              <Text style={{color:"white", fontSize: 20}}>{this.state.buttonText}</Text>   
          </TouchableOpacity>
        </View>
      </View>
    );
  }
} 

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 10,
  },

  sensor: {
    height: "100%",
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 0,
    marginBottom: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
});