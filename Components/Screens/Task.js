import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, BackHandler, StyleSheet, Modal } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import { styles, modalstyles } from './Home'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons'
import BackgroundTimer from 'react-native-background-timer';
import Sound from 'react-native-sound'
function Task({ route, navigation }) {
    const [modalvisible, setModalvisible] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)
    const [title, settitle] = useState('')
    const [description, setdescription] = useState('')
    const [type, settype] = useState('')
    const [timeset, settimeset] = useState(0)
    const [timeleft, settimeleft] = useState(0)
    const [timer, settimer] = useState(3600)
    const [running, setrunning] = useState(false)
    const [hrs, sethrs] = useState(0)
    const [mins, setmins] = useState(0)
    const [secs, setsecs] = useState(0)
    const [timetoshow,settimetoshow] = useState('')
    const interval = useRef()
    const [whoosh,setwhoosh]=useState('')
    Sound.setCategory('Playback')
    useEffect(()=>{
        setwhoosh(new Sound('song.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound$$$$$$$$$$$$$$$$$$$$$', error);
                return;
            }
            // console.log("Song loaded^^^^^^^",whoosh.getDuration())
    
        }))
    },[])


    const setdata = async () => {
        setrunning(false)
        const jsondata = await AsyncStorage.getItem('tasks')
        const data = JSON.parse(jsondata)
        data.forEach(item => {
            if (item.id == route.params.id) {
                item.timeleft = timeleft
                if (timeleft == 0) {
                    item.completed = true
                }
            }
        })
        AsyncStorage.setItem('tasks', JSON.stringify(data))
        var today = new Date()
        let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]
        let day = weekdays[today.getDay()]
        AsyncStorage.getItem('data').then().then(value => {
            value = JSON.parse(value)
            console.log("Testing.......................######################..................")
            if (value == null) {
                let arr = [{ day: day, hrs: (timeset - timeleft) }]
                console.log("value is null#################")
                AsyncStorage.setItem('data', JSON.stringify(arr))
            }
            else {
                if (value.length < 7) {
                    let arr = { day: day, hrs: (timeset - timeleft) }
                    let flag = false
                    console.log("value lenght is ", value.length)
                    console.log("value is not null#################", value)
                    value[value.length - 1].day == day ? flag = true : flag = false
                    if (flag) {
                        value[value.length - 1].hrs += timeset - timeleft
                    }
                    else {
                        value.push(arr)
                    }
                    AsyncStorage.setItem('data', JSON.stringify(value))
                }
                else if (value.length == 7) {
                    console.log("************")
                    let flag = false
                    value[6].day == day ? flag = true : flag = false
                    if (flag) {
                        value[6].hrs += timeset - timeleft
                        console.log("value is not null#################", value)
                        AsyncStorage.setItem('data', JSON.stringify(value))
                    }
                    else {
                        value.shift()
                        value.push({ day: day, hrs: timeset - timeleft })
                        AsyncStorage.setItem('data', JSON.stringify(value))
                    }
                }
            }

            // AsyncStorage.setItem('data', JSON.stringify(olddata))
        })
    }
    const taskcompleted = async () => {
        console.log('task completed has been called')
        setrunning(false)
        const jsondata = await AsyncStorage.getItem('tasks')
        const data = JSON.parse(jsondata)
        data.forEach(item => {
            if (item.id === route.params.id) {
                item.timeleft = 0
                item.completed = true
            }
        })
        AsyncStorage.setItem('tasks', JSON.stringify(data))
        // Alert.alert(
        //     'Task Completed',
        //     'Task will be marked as completed for today and will be available tomorrow',
        //     [
        //         // {
        //         //     text: 'Cancel',
        //         //     onPress: () => console.log('Cancel Pressed'),
        //         //     style: 'cancel',
        //         // },
        //         { text: 'OK', onPress: () => {
        //             back()
        //         } },
        //     ],
        //     { cancelable: false },
        // );
        back()
    }
    useEffect(() => {
        const backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
            console.log('back pressed')
            setdata()
            // navigation.navigate('Home')
        })
        return () => {
            backhandler.remove()
        }
    })
    const getdata = async () => {
        const jsondata = await AsyncStorage.getItem('tasks')
        const data = JSON.parse(jsondata)
        if (!data) {
            Alert.alert('No Tasks Found')
        }
        const task = data.find(item => item.id == route.params.id)
        settitle(task.title)
        setdescription(task.description)
        settype(task.type)
        settimeset(task.timemset)
        settimeleft(task.timeleft)
        settimer(task.timeleft + "seconds")
        console.log("done")
        setTimeforvisibility(task.timemset)
        setProgress(100 - (task.timeleft / task.timemset) * 100)
        let secs = task.timeleft
        sethrs(Math.floor(secs / 3600).toString().length > 1 ? Math.floor(secs / 3600).toString() : '0' + Math.floor(secs / 3600).toString())
        setmins(Math.floor((secs % 3600) / 60).toString().length > 1 ? Math.floor((secs % 3600) / 60).toString() : '0' + Math.floor((secs % 3600) / 60).toString())
        setsecs((secs % 60).toString().length > 1 ? (secs % 60).toString() : '0' + (secs % 60).toString())


    }
    const setTimeforvisibility = (time) => {
        if (time>3600) {
            settimetoshow(time/3600+" hrs")
        }
        else if (time>60) {
            settimetoshow(time/60+" mins")
        }
        else {
            settimetoshow(time+" secs")
        }
    }
    const start = () => {
        // whoosh.play()
        setrunning(true)
        let secs = timeleft
        interval.current = BackgroundTimer.setInterval(() => {
            secs -= 1
            if(secs<2){
                whoosh.play()
            }
            if (secs == 0) {
                console.log("Time left is 0 so setting to 0")
                settimeleft(0)
                // clearInterval(interval.current)
                BackgroundTimer.clearInterval(interval.current)
                taskcompleted()

            }
            sethrs(Math.floor(secs / 3600).toString().length > 1 ? Math.floor(secs / 3600).toString() : '0' + Math.floor(secs / 3600).toString())
            setmins(Math.floor((secs % 3600) / 60).toString().length > 1 ? Math.floor((secs % 3600) / 60).toString() : '0' + Math.floor((secs % 3600) / 60).toString())
            setsecs((secs % 60).toString().length > 1 ? (secs % 60).toString() : '0' + (secs % 60).toString())
            settimer(secs)
            settimeleft(secs)
            let perc = 100 - (secs / timeset) * 100
            setProgress(perc)

        }, 1000);
    }
    const stop = () => {
        setrunning(false)
        whoosh.stop()
        BackgroundTimer.clearInterval(interval.current)
        // settimeset(timeleft)

    }
    const unmount = () => {
        console.log("timeleft on unmount ", timeleft)
    }
    useEffect(() => {
        getdata()
        return async () => {
            console.log("unmount")
            BackgroundTimer.clearInterval(interval.current)
            console.log("timer", timer)
            console.log("timeleft", timeleft)
            unmount()
            //change the time left in async storage with the tadk id
        }
    }, [])
    const back = () => {
        setdata()
        navigation.goBack()
    }
    const deleteTask = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK', onPress: () => {
                        AsyncStorage.getItem('tasks').then(value => {
                            let data = JSON.parse(value)
                            data = data.filter(item => item.id != route.params.id)
                            AsyncStorage.setItem('tasks', JSON.stringify(data))
                            setdata()
                            navigation.goBack()
                        })
                    }
                },
            ],
            { cancelable: false },
        );
    }


return (
    <View style={styles.container}>
        <Modalx visible={modalvisible} />
        <View style={{ ...styles.titlecontainer, width: "100%", margin: 0 }}>
            <View style={stylesx.back}>
                <AntDesign name="arrowleft" size={20} color="rgba(0,0,0,0.4)" onPress={() => back()} />
            </View>
            <Ionicons name="ios-trash-bin" size={20} color="rgba(0,0,0,0.4)" onPress={() => deleteTask()} />
        </View>
        <ScrollView style={styles.Scrollcontainer}>
            <Text style={{ ...styles.text1, marginTop: 20, fontWeight: "500", color: "rgba(0,0,0,0.3)" }}>Task to do</Text>
            <Text style={{ ...styles.text2, marginTop: 10 }}>{title}</Text>
            <View style={{ ...styles.row, marginTop: 10 }}>
                <View style={{ ...styles.badge, marginLeft: 0, width: "auto", paddingHorizontal: 10, paddingVertical: 2, height: "auto" }}>
                    <Text style={{ ...styles.text4 }}>{type}</Text>
                </View>
                <Text style={{ fontSize: 12, marginLeft: 10 }}>{timetoshow}</Text>
            </View>
            <Text style={{ ...styles.text1, marginTop: 20, fontWeight: "500", color: "rgba(0,0,0,0.3)" }}>Description</Text>
            <Text style={{ ...styles.text3, marginTop: 10, color: "rgba(0,0,0,0.7)" }}>{description}</Text>
            <View style={{
                display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", zIndex: 23, marginTop: "30%"
            }}>
                <AnimatedCircularProgress
                    style={{ zIndex: 120, elevation: 23 }}
                    size={200}
                    width={6}
                    fill={progress}
                    tintColor="#00B26A"
                    onAnimationComplete={() => console.log('onAnimationComplete')}
                    backgroundColor="rgba(00,0,0,.3)" >
                    {
                        () => (
                            <View>
                                <Text style={{ ...styles.text3, fontSize: 24 }}>{hrs} : {mins} : {secs}</Text>
                            </View>
                        )
                    }
                </AnimatedCircularProgress>
            </View>
        </ScrollView>
        <View style={{ width: "100%", bottom: 0, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 }}>
            <TouchableOpacity onPress={stop} style={stylesx.but}>
                <Text style={{ ...styles.text3, color: running ? "#00B26A" : "rgba(0,0,0,0.3)" }}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={start} style={stylesx.but1}>
                <Text style={{ ...styles.text3, color: running ? "rgba(0,0,0,0.3)" : "#00B26A" }}>Start</Text>
            </TouchableOpacity>

        </View>
    </View>
)
}

export default Task

const stylesx = StyleSheet.create({
    but: {
        width: 100,

        borderRadius: 10,
        height: 50,
        justifyContent: "center",
        alignItems: "flex-start"
    },
    but1: {
        width: 100,

        borderRadius: 10,
        height: 50,
        justifyContent: "center",
        alignItems: "flex-end"
    },
    back: {
        width: 50,
        height: 30,
        // backgroundColor:"red"
    }
})

const Modalx=({visible})=>{
    return(
        <Modal visible={visible}>
            <View style={{...styles.modal,backgroundColor:"red"}}>
                <Text>Modal</Text>
            </View>

        </Modal>
    )
}