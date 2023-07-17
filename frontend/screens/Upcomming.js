import { useFocusEffect } from "@react-navigation/native"
import React, { useEffect, useRef, useState } from "react"
import { View,Text, Button, ActivityIndicator, useWindowDimensions, StyleSheet, TouchableOpacity, Dimensions, Alert } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import  axios  from "axios"
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux"
import { addData } from "../actions/data"
import { FlatList } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import { InterstitialAd,BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


let interstitial


export default function Upcomming() {

  const [leagueNames, setLeagueNames] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSmall, setIsLoadingSmall] = useState(false);
  const {fontScale} = useWindowDimensions(); // import useWindowDimensions()
  const [errStatus, setErrStatus] = useState();
  const [errStatus2, setErrStatus2] = useState();
  const styles = makeStyles(fontScale);
  const [wantReload, setWantReload] = useState(true)
  const [tryAgain, setTryAgain] = useState()
  const [tryAgain2, setTryAgain2] = useState()

  const data =  useSelector((state)=>state.data);
  const dispatch = useDispatch();

  const windowHeight = Dimensions.get('window').height;
  
  const pickerRef = useRef();


  
  const adUnitId =  'ca-app-pub-4487344159300856/1558356888';
  const adUnitId2 =  'ca-app-pub-4487344159300856/4535927911' ;





  useEffect(()=>{
    if(data?.personal){
      try{
        if(!interstitial){

          interstitial = InterstitialAd.createForAdRequest(adUnitId2, {
            requestNonPersonalizedAdsOnly: !data.personal.allowed,
          });
          interstitial.load()
        }
      }catch(err){
        console.log(err)
      }
    }
  },[data, interstitial])


  const axRequest = () => {
    axios({
      method: 'get',  
      timeout: 15000,
      url: 'https://rugbyfix.eu-4.evennode.com/api/leagues',
    }).then((res)=>{
      if(res?.data?.results && res?.data?.results?.results > 0 && res?.data?.results?.errors?.length < 1){
        const placeholder = (res.data.results.response).filter((item)=> new Date(item.seasons[0].end) > new Date())            
        const storable = JSON.stringify({ season: new Date().toISOString().split("T")[0], results: placeholder })
        AsyncStorage.setItem('leagues', storable)
        setLeagueNames(placeholder.map((item)=> { return { label: item.name, value: item.id } }))
      }else{
        setErrStatus("Server side error")
        setTryAgain((Date().now() + 120000))
      }
      setIsLoading(false)
    }).catch((err)=>{
      if(err.code === 'ECONNABORTED'){
        setErrStatus("Connection Timeout")
      }else if(err.code === 'ERR_NETWORK'){
        setErrStatus("Network error")
      }else{
        setErrStatus("Unknown Error")
        const timeNext = (Date.now() + 120000)
        setTryAgain(timeNext)
      }
      setIsLoading(false)
    })
  }

  const getData = async () => {
    if(wantReload){
      setIsLoading(true)
      try {
        const value =  JSON.parse(await AsyncStorage.getItem('leagues'));
        if (value !== null) {
          if((value.season !== (new Date()).toISOString().split("T")[0] )){
            axRequest()
          }else{
            setLeagueNames(value.results.map((item)=>{ return { value: item.id, label: item.name } }))
            setIsLoading(false)
          }
        }else{
          axRequest()
        }
      } catch (e) {
        setErrStatus("A unknown error occured")
        setIsLoading(false)
      }
    }
    if(wantReload){
      setWantReload(false)
    }
    
  };

  const getLeagueGames  = () => {

      if(!isLoadingSmall){
        setIsLoadingSmall(true)
        if(!data["league-"+pickerRef?.current?.props?.selectedValue]){
          axios({
            method: 'get',  
            timeout: 15000,
            url: 'https://rugbyfix.eu-4.evennode.com/api/league',
            params: {
              id: pickerRef.current.props.selectedValue
            }
          }).then((res)=>{
            if(res?.data?.results && res?.data?.results?.results > 0 && res?.data?.results?.errors?.length < 1){
              
              var fieldName = "league-"+pickerRef.current.props.selectedValue
              
              var placeholder = (res.data.results.response.filter((item)=> item.status.short === "FT")).map((item)=>{
                return {
                  date: item.date,
                  status: item.status.short,
                  teams: {
                    hname:item.teams.home.name,
                    hlogo:item.teams.home.logo,
                    aname:item.teams.away.name,
                    alogo:item.teams.away.logo
                  },
                  scores: item.scores

                }
              }).slice(-20)

               
              var placeholder2 = (res.data.results.response.filter((item)=> item.status.short === "NS")).map((item)=>{
                return {
                  date: item.date,
                  status: item.status.short,
                  teams: {
                    hname:item.teams.home.name,
                    hlogo:item.teams.home.logo,
                    aname:item.teams.away.name,
                    alogo:item.teams.away.logo
                  },
                  scores: item.scores

                }
              }).slice(0,20) 
              

              let gridObject = {}            
              gridObject[fieldName] =  placeholder2.concat(placeholder)
               

              dispatch(
                addData(
                  gridObject
                )
              )           
              setIsLoadingSmall(false)
            }else{
              setIsLoadingSmall(false)
            }
          }).catch((err)=>{
            if(err.code === 'ECONNABORTED'){
              setErrStatus2("Connection Timeout")
            }else if(err.code === 'ERR_NETWORK'){
              setErrStatus2("Network error")
            }else{
              setErrStatus2("Unknown Error")
              const timeNext = (Date.now() + 120000)
              setTryAgain2(timeNext)
            }
            setIsLoadingSmall(false)
          })
        }else{
          setInterval((()=>{setIsLoadingSmall(false)}),3000)
        }
      }
  }

  useFocusEffect(React.useCallback(()=>{
      getData()
  },[wantReload]))
  


  if(errStatus){
    return (      
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.ErrorText}>
              {errStatus}
          </Text>
          <TouchableOpacity style={{marginTop: 4}} onPress={()=>{
            if(tryAgain){
              if(Date.now() > tryAgain){
                setErrStatus(null)
                setIsLoading(true)
                setWantReload(true)
                setTryAgain(null)
              }
            }else{
              setErrStatus(null)
              setIsLoading(true)
              setWantReload(true)
            }
            
          }}>
            <View style={{borderRadius: 8, borderWidth: 2, padding: 5}}>
              <Icon name="refresh-circle-outline" size={50/fontScale} color={'black'}></Icon>
              <Text style={{fontSize: 15/fontScale, fontWeight: 'bold'}}>Reload</Text>
            </View>
            
          </TouchableOpacity>
      </View>
  )
  }



  if(isLoading){
    return(
      <View style={{flex:1, justifyContent: 'center'}}>
          <ActivityIndicator size={56/fontScale} />
          <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
            Loading
          </Text>
      </View>
    )
  }

  if(!isLoading){
    return (
    <View style={{flex: 1}}>
       {/* {data?.personal && (
           <BannerAd
           unitId={adUnitId}
           size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
           requestOptions={{
             requestNonPersonalizedAdsOnly: !data.personal.allowed,
           }}
          />
        )}     */}
      <Picker
        style={{
          maxWidth: 500
        }}
        ref={pickerRef}
        selectedValue={selectedItem}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedItem(itemValue)
        }>
          <Picker.Item label={"Select a league"} value={-1} ></Picker.Item>
        {leagueNames.map((item)=>(
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
        
      </Picker>
          <View style={{maxWidth: 500}}>
            
          
          <Button  title="Load Matches" onPress={()=>{

        if(pickerRef?.current?.props?.selectedValue && pickerRef?.current?.props?.selectedValue != -1 ){
          if(tryAgain2){
            if(Date.now() > tryAgain2){
              setErrStatus2(null)
              setIsLoadingSmall(true)
              getLeagueGames()
              setTryAgain2(null)
              // if(interstitial?.loaded){
              //   if(Math.floor(Math.random() * 2) === 1  ){
              //     interstitial.show()
              //     interstitial.load()
              //   }
              // }else{
              //   interstitial?.load()
              // }
            }
          }else{
            setErrStatus2(null)
            setIsLoadingSmall(true)
            getLeagueGames()
            // if(interstitial?.loaded){
            //   if(Math.floor(Math.random() * 2) === 1  ){
            //     interstitial.show()
            //     interstitial.load()
            //   }
            // }else{
            //   interstitial?.load()
            // }
          }
        }else{
          Alert.alert('Need A Rugby League',"Please Select a valid league from the dropdown options")
        }


        
      }} ></Button></View>


      {isLoadingSmall && (
          <View style={{flex:1, justifyContent: 'center'}}>
              <ActivityIndicator size={56/fontScale} />
              <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                Loading
              </Text>
          </View>
        
      )}

      {errStatus2 && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.ErrorText}>
              {errStatus2}
          </Text>
        <TouchableOpacity style={{marginTop: 4}} onPress={()=>{
          if(tryAgain2){
            if(Date.now() > tryAgain2){
              setErrStatus2(null)
              setIsLoadingSmall(true)
              getLeagueGames()
              setTryAgain2(null)
            }
          }else{
            setErrStatus2(null)
            setIsLoadingSmall(true)
            getLeagueGames()
          }
          
        }}>
          <View style={{borderRadius: 8, borderWidth: 2, padding: 5}}>
            <Icon name="refresh-circle-outline" size={50/fontScale} color={'black'}></Icon>
            <Text style={{fontSize: 15/fontScale, fontWeight: 'bold'}}>Reload</Text>
          </View>
          
        </TouchableOpacity>
    </View>
      )}

    {((data["league-"+pickerRef?.current?.props?.selectedValue])?.filter((item)=>{return item.status === "NS"}).length === 0 && !isLoadingSmall) && (
       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.ErrorText}>
          No Upcomming Games
        </Text>
      </View>
    )}

      {((data["league-"+pickerRef?.current?.props?.selectedValue])?.filter((item)=>{return item.status === "NS"}).length > 0 && !isLoadingSmall) && (
        <>
        <FlatList style={{height: '100%' }}
          data={(data["league-"+pickerRef.current.props.selectedValue]).filter((item)=>{return item.status === "NS"})}
          renderItem={({item})=> (
            <View style={{borderColor: 'black', borderBottomWidth: 1, height: windowHeight*0.19, alignItems: 'center', maxWidth: 500, paddingTop: 1}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 2}}>
                  <Text style={{color: 'black', fontSize: 16/fontScale, textAlign: 'center', fontWeight: 'bold'}}>
                    {item.teams.hname}
                  </Text>
                 </View>
                 <View style={{flex: 1}}>

                 </View>
                 <View style={{flex: 2}}>
                    <Text style={{fontSize: 16/fontScale, color: 'black',  textAlign: 'center', fontWeight: 'bold'}}>
                    {item.teams.aname}
                    </Text>
                 </View>
                 
                
            </View>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                <FastImage
                  style={{height: '70%', width: '70%'  }}
                  source={{
                    uri: item.teams.hlogo,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                >
                </FastImage>
              </View>
              

                <View style={{flex: 1, justifyContent: 'center'}}>
                  <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 16/fontScale, color: 'black'}}>
                    VS
                  </Text>
                  <Text style={{fontSize: 14/fontScale, fontWeight: 'bold',textAlign: 'center'}}>{item.date.split("T")[0] }</Text>
                  <Text style={{fontSize: 14/fontScale, fontWeight: 'bold',textAlign: 'center'}}>{(new Date(item.date)).toLocaleTimeString() }</Text>

                
                </View>


                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                  <FastImage
                    style={{height: '75%', width: '75%'}}
                    source={{
                      uri: item.teams.alogo,
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  >
                  </FastImage>
              </View>
            </View>
           
            {
              ["1H","2H","ET", "BT", "PT", "HT"].includes(item.status) && (
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <View style={{flex: 2}}>
                    <Text style={[{fontWeight: 'bold', textAlign: 'center', fontSize: 20/fontScale}, item.scores.home>item.scores.away&&{color: 'green'}, item.scores.home<item.scores.away&&{color: 'red'}]}>{item.scores.home}</Text>
                  </View>
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    
                    {item.status === "HT" ? (
                      <Text style={{fontWeight: 'bold',color:'black', fontSize: 14/fontScale}}>
                        Half Time
                      </Text>
                    ):(
                      <Text style={{fontWeight: 'bold',color: 'black' ,fontSize: 14/fontScale}}>
                        Live!
                      </Text>
                    )}
                    
                  
                  </View>
                  
                  <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={[{fontWeight: 'bold', textAlign: 'center', fontSize: 20/fontScale},item.scores.away>item.scores.home&&{color: 'green'}, item.scores.away<item.scores.home&&{color: 'red'}]}>{item.scores.away}</Text>
                  </View>

                </View>
              )
            }

            {
              ["AW","POST","CANC", "INTR", "ABD"].includes(item.status) && (
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: 14/fontScale , fontWeight: 'bold', color: 'red'}}>
                      Game Abandoned
                  </Text>
                </View>
              )
            }

            
{
              ["AET", "FT"].includes(item.status) && (
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                  
                   <View style={{flex: 2}}>
                    <Text style={[{fontWeight: 'bold', textAlign: 'center', fontSize: 20/fontScale}, item.scores.home>item.scores.away&&{color: 'green'}, item.scores.home<item.scores.away&&{color: 'red'}]}>{item.scores.home}</Text>
                  </View>
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    
                    
                      <Text style={{fontWeight: 'bold',color:'black', fontSize: 14/fontScale}}>
                        Full Time
                      </Text>
                  
                    
                  
                  </View>
                  
                  <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={[{fontWeight: 'bold', textAlign: 'center', fontSize: 20/fontScale},item.scores.away>item.scores.home&&{color: 'green'}, item.scores.away<item.scores.home&&{color: 'red'}]}>{item.scores.away}</Text>
                  </View>
                </View>
              )
            }




           
          </View>
          )}
          keyExtractor={item=>{return item.date + item.teams.hname + item.teams.aname}}

        >
        </FlatList>
        </>
      ) }
                 
     
    </View>
  )}

  return <></>
}

const makeStyles = fontScale => StyleSheet.create({
  ErrorText: {
    fontSize: 30/fontScale,
    fontWeight: 'bold',
    color: '#AF0606',
    textAlign: 'center'
  }
})
