import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Image, View, Platform, Text, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function HomeScreen({navigation}) {
  const [image, setImage] = useState(null);
  const [pred, setPred] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  function timeout(ms, promise) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(new Error("timeout"))
      }, ms)
      promise.then(resolve, reject)
    })
  }
  
  // timeout(1000, fetch('/hello')).then(function(response) {
  //   // process response
  // }).catch(function(error) {
  //   // might be a timeout error
  // })

  const sendToAPI = (data) => {
    timeout( 50000, fetch("http://127.0.0.1:5000/api", {
      method:'POST',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
     }
  }).then(res => res.json())
  .then(res => {
    console.log("FROM API:", res)
    setPred(res.key1)
  }))
  }

  const pickImage = async () => {
    let data = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("RESULT:", data);

    sendToAPI(data);

    if (!data.cancelled) {
      let newfile = {
        uri:data.uri, 
        type:'test/jpg', 
        name:'test.jpg'
      }
      handleUpload(newfile)
    }
  };

  const clickImage = async () => {
    let data = await ImagePicker.launchCameraAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      aspect: [4, 3]
    });

    if (!data.cancelled) {
      let newfile = {
        uri:data.uri, 
        type:'test/jpg', 
        name:'test.jpg'
      }
      handleUpload(newfile)
    }
  };

  const handleUpload = (image) => {
    console.log("Image: ", image);
    const data = new FormData()
    if(Platform.OS==='android') {
      data.append('file', image)
      data.append("upload_preset", "cropApp")
      data.append("cloud_name", "avn007")
    } else {
      data.append('file', image.uri)
      data.append("upload_preset", "cropApp")
      data.append("cloud_name", "avn007")
    }

    fetch("https://api.cloudinary.com/v1_1/avn007/image/upload", {
      method: 'POST',
      body: data
    }).then(res => res.json()).
    then(data => {
      console.log(data)
      setImage(data.url);
    })
  };

  return (
    <View style={styles.container}>
      {/* <ImageBackground style={{flex: 1, alignItems: "center", justifyContent: "center"}} source={require('./assets/bg2.jpg')}> */}

      {image && <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />}
      {image && <Text style={styles.prediction}>{pred}</Text>}
      {/* {image && <Button title="Know More" onPress={() => navigation.navigate("More")} />} */}

      <View  style={{ marginTop: 10, width: '100%', position: 'absolute', bottom: 50 }} >
      <Button title={image==null?"Upload an image":"Image Uploaded"} color={image==null?"#FF6666":"grey"}  onPress={pickImage} />
      </View>

      <View style={{ marginTop: 10, width: '100%', position: 'absolute', bottom: 5 }}>
      <Button title={image==null?"Click a Photo":"Image Uploaded"} color={image==null?"#6666FF":"grey"} onPress={clickImage} />
      </View>
      {/* </ImageBackground> */}
    </View>
  )
}

function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.prediction} >More Details....</Text>
    </View>
  )
}

const Stack = createStackNavigator()

export default function ImagePickerExample() {

  return (
    // <View style={styles.container}>
    //   {image && <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />}
    //   {image && <Text style={styles.prediction}>{pred}</Text>}
    //   <View  style={{ marginTop: 10, width: '100%', position: 'absolute', bottom: 50 }} >
    //   <Button title={image==null?"Upload an image":"Image Uploaded"} color={image==null?"#FF6666":"grey"}  onPress={pickImage} />
    //   </View>

    //   <View style={{ marginTop: 10, width: '100%', position: 'absolute', bottom: 5 }}>
    //   <Button title={image==null?"Click a Photo":"Image Uploaded"} color={image==null?"#6666FF":"grey"} onPress={clickImage} />
    //   </View>
    // </View>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Find Disease',
            headerStyle: {
              backgroundColor: '#006666',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              alignSelf: 'center',
              fontSize: 24
            },
          }} 
        />
        <Stack.Screen name="More" component={MoreScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#99FF99'
  },
  prediction: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#990099'
  }
})