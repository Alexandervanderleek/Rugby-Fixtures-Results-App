import { useFocusEffect } from "@react-navigation/native"
import React, { useState } from "react"
import { View,Text, ActivityIndicator, StyleSheet, useWindowDimensions, Dimensions } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { addData } from "../actions/data"
import  axios  from "axios"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

// const adUnitId =  'ca-app-pub-4487344159300856/8207579611';






export default function Today() {

  const {fontScale} = useWindowDimensions(); // import useWindowDimensions()
  const styles = makeStyles(fontScale); // pass in fontScale to the StyleSheet
  const windowHeight = Dimensions.get('window').height;


    const data =  useSelector((state)=>state.data);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [wantReload, setWantReload] = useState(true)

    useFocusEffect(React.useCallback(()=>{
        if((!data.hasOwnProperty('today') || (Date.now() - data.today?.timestamp > 120000 )) && wantReload ){
          setIsLoading(true)

          axios({
            method: 'get',
            timeout: 15000,
            url: 'https://rugbyfix.eu-4.evennode.com/api/today',
          }).then((res)=>{
            if(res.data.results){
              res.data.results['timestamp'] = res.data.results.results > 0 ? Date.now() : Date.now() + 180000
              dispatch(
                addData(
                  {today: res.data.results}
                )
              )
            }else{
              dispatch(
                addData(
                  {
                    today : {
                      timestamp: Date.now(),
                      errors: ['none']
                    }
                    
                  }
                )
              )
            }
            setIsLoading(false)

          }).catch((err)=>{
            if(err.code === 'ECONNABORTED'){
              dispatch(
                addData(
                  {
                    today : {
                      timestamp: 0,
                      errors: ['timeout']
                    }
                    
                  }
                )
              )
            }else if(err.code === 'ERR_NETWORK'){
              dispatch(
                addData(
                  {
                    today : {
                      timestamp: 0,
                      errors: ['networkerr']
                    }
                    
                  }
                )
              )
            }else{
              dispatch(
                addData(
                  {
                    today : {
                      timestamp: 0,
                      errors: ['serverErr']
                    }
                    
                  }
                )
              )
            }
            setIsLoading(false)
          })
          setWantReload(false)
        }
        setWantReload(false)
    },[data, wantReload]))


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

  if(data?.today?.errors?.length>0){
    switch(data.today.errors[0]){
      case "timeout":{
        return (  
          <>    
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.ErrorText}>
                  Timeout Error
              </Text>
              <TouchableOpacity style={{marginTop: 4}} onPress={()=>{
                setWantReload(true)
              }}>
                <View style={{borderRadius: 8, borderWidth: 2, padding: 5}}>
                  <Icon name="refresh-circle-outline" size={50/fontScale} color={'black'}></Icon>
                  <Text style={{fontSize: 15/fontScale, fontWeight: 'bold', textAlign: 'center'}}>Reload</Text>
                </View>
                
              </TouchableOpacity>
          </View>
          {/* <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: !data.personal.allowed,
          }}
        /> */}
        </>
      )
      };
      case "networkerr":{
        return (      
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.ErrorText}>
                  Network error
              </Text>
              <TouchableOpacity style={{marginTop: 4}} onPress={()=>{
                setWantReload(true)
              }}>
                <View style={{borderRadius: 8, borderWidth: 2, padding: 5}}>
                  <Icon name="refresh-circle-outline" size={50/fontScale} color={'black'}></Icon>
                  <Text style={{fontSize: 15/fontScale, fontWeight: 'bold'}}>Reload</Text>
                </View>
                
              </TouchableOpacity>
          </View>
          
      )
      };
      default:{
        return (    
          <>  
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.ErrorText}>
              Server Error
            </Text>
              <TouchableOpacity style={{marginTop: 4}} onPress={()=>{
                setWantReload(true)
              }}>
                <View style={{borderRadius: 8, borderWidth: 2, padding: 5}}>
                  <Icon name="refresh-circle-outline" size={50/fontScale} color={'black'}></Icon>
                  <Text style={{fontSize: 15/fontScale, fontWeight: 'bold', textAlign: 'center'}}>Retry</Text>
                </View>
          
              </TouchableOpacity>
          </View>
          {/* <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: !data.personal.allowed,
                }}
              /> */}
          </>
      )
      }
    }
    
  }



  if(data?.today?.results > -1){      
    if(data?.today?.results === 0){
      return(
        <>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.ErrorText}>
            No Games Today
          </Text>
            <TouchableOpacity style={{marginTop: 4}} onPress={()=>{
              setWantReload(true)
            }}>
              <View style={{borderRadius: 8, borderWidth: 2, padding: 5, alignItems: 'center'}}>
                <Icon name="refresh-circle-outline" size={50/fontScale} color={'black'}></Icon>
                <Text style={{fontSize: 15/fontScale, fontWeight: 'bold', textAlign: 'center'}}>Refresh</Text>
              </View>
        
            </TouchableOpacity>
            
                    </View>
            
                    
              {/* <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: !data.personal.allowed,
                }}
              /> */}
          
            </>        

      )
    }else{

      return(

      <View style={{flex: 1}}>

        <View style={{flexDirection: 'row', padding: 4, maxWidth: 500, alignItems: 'center',  justifyContent: 'space-evenly', borderColor: 'black', borderBottomWidth: 1}}>
          <Text style={{fontSize: 15/fontScale, color: 'black', fontWeight: 'bold'}}>
            Refresh @ {(new Date(data.today.timestamp + 120000) ).toLocaleTimeString()}
          </Text>
          <TouchableOpacity onPress={()=>{setWantReload(true)}} style={{borderColor: 'black', borderWidth: 1, borderRadius: 10, backgroundColor: '#1DA1F2'}}>
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 2}}>
              <Text style={{fontSize: 15/fontScale, marginLeft: 1, marginRight: 1, color: 'black'}}>
                Refresh
              </Text>
              <Icon name="refresh-circle-outline" size={40/fontScale} color={'black'}></Icon>
            </View>
            
          </TouchableOpacity>
        </View>

        <FlatList style={{height: '100%' }}
          data={data.today.response}
          renderItem={({item})=> (
            <View style={{borderColor: 'black', borderBottomWidth: 1, height: windowHeight*0.19, alignItems: 'center', maxWidth: 500, paddingTop: 1}}>
              <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 2}}>
                    <Text style={{color: 'black', fontSize: 16/fontScale, textAlign: 'center', fontWeight: 'bold'}}>
                      {item.teams.home.name}
                    </Text>
                   </View>
                   <View style={{flex: 1}}>

                   </View>
                   <View style={{flex: 2}}>
                      <Text style={{fontSize: 16/fontScale, color: 'black',  textAlign: 'center', fontWeight: 'bold'}}>
                      {item.teams.away.name}
                      </Text>
                   </View>
                   
                  
              </View>
              <View style={{flexDirection: 'row', flex: 1}}>
                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                  <FastImage
                    style={{height: '70%', width: '70%'  }}
                    source={{
                      uri: item.teams.home.logo,
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
                    <Text style={{fontSize: 14/fontScale, fontWeight: 'bold',textAlign: 'center'}}>{(new Date(item.date)).toLocaleTimeString()}</Text>
                    <Text style={{fontSize: 14/fontScale, fontWeight: 'bold',textAlign: 'center'}}>{item.league.name}</Text>
                  </View>


                  <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                    <FastImage
                      style={{height: '75%', width: '75%'}}
                      source={{
                        uri: item.teams.away.logo,
                        priority: FastImage.priority.normal,
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                    >
                    </FastImage>
                </View>
              </View>
             
              {
                ["1H","2H","ET", "BT", "PT", "HT"].includes(item.status.short) && (
                  <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{flex: 2}}>
                      <Text style={[{fontWeight: 'bold', textAlign: 'center', fontSize: 20/fontScale}, item.scores.home>item.scores.away&&{color: 'green'}, item.scores.home<item.scores.away&&{color: 'red'}]}>{item.scores.home}</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                      
                      {item.status.short === "HT" ? (
                        <Text style={{fontWeight: 'bold',color:'black', fontSize: 14/fontScale}}>
                          Half Time
                        </Text>
                      ):(
                        <Text style={{fontWeight: 'bold',color: 'green' ,fontSize: 14/fontScale}}>
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
                ["AW","POST","CANC", "INTR", "ABD"].includes(item.status.short) && (
                  <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 14/fontScale , fontWeight: 'bold', color: 'red'}}>
                        Game Abandoned
                    </Text>
                  </View>
                )
              }


{
                ["AET", "FT"].includes(item.status.short) && (
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
          keyExtractor={item=>item.id}

        >
        </FlatList>

        {data?.personal && (
           <BannerAd
           unitId={adUnitId}
           size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
           requestOptions={{
             requestNonPersonalizedAdsOnly: !data.personal.allowed,
           }}
          />
        )}
       
      </View>
      )
    } 
     
            
     

    
  }


  return ( 
    <></>
  )
}

const makeStyles = fontScale => StyleSheet.create({
    ErrorText: {
      fontSize: 30/fontScale,
      fontWeight: 'bold',
      color: '#AF0606',
      textAlign: 'center'
    },
    noGamesText: {
      fontSize: 30/fontScale,
      fontWeight: 'bold',
      textAlign: 'center'
    }
})



