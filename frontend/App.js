/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';  
import HomeTab from './screens/HomeTab';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch } from "react-redux"
import { addData } from './actions/data';
import { AdsConsent, AdsConsentStatus  } from 'react-native-google-mobile-ads';




const Stack = createStackNavigator();



async function Consent(dispatcher){

  try{

  AdsConsent.reset()

  const consentInfo = await AdsConsent.requestInfoUpdate()
  

  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
    await AdsConsent.showForm();
    const { selectPersonalisedAds } = await AdsConsent.getUserChoices();
    dispatcher(
      addData(
        {
          personal : {
            allowed: selectPersonalisedAds,
          }
          
        }
      )
    )
  }else{
    if(consentInfo.status === AdsConsentStatus.OBTAINED){
      const { selectPersonalisedAds } = await AdsConsent.getUserChoices();
      dispatcher(
        addData(
          {
            personal : {
              allowed: selectPersonalisedAds,
            }
            
          }
        )
      )
    }else{
      dispatcher(
        addData(
          {
            personal : {
              allowed: true,
            }
            
          }
        )
      )
    }
  }

  }catch(err){
    console.log(err)
  }
}






 function App() {

  const dispatch = useDispatch();

  Consent(dispatch)

  return (
    <NavigationContainer>
       <Stack.Navigator screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen   name="Home" component={HomeTab}  /> 
      </Stack.Navigator> 
    </NavigationContainer>
  );
} 



export default App;
