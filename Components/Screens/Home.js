import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Alert, BackHandler, Dimensions } from 'react-native'
import FontAwesome from 'react-native-vector-icons/Fontisto'
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Entypo from 'react-native-vector-icons/Entypo'
import Materialicons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/core';
import { LineChart } from 'react-native-chart-kit'
const screenWidth = Dimensions.get("window").width - 20;

function Home({ navigation }) {
    const [date, setDate] = useState('')
    const [modal, setModal] = useState(false)
    const [containeropacity, setcontaineropacity] = useState(1)
    const [tasks, setTasks] = useState([])
    const [taskscompleted, setTaskscompleted] = useState([])
    const focussed = useIsFocused()
    // const [timetoshow,settimetoshow] = useState("")
    const [data, setData] = useState({
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43, 23],
                color: (opacity = 1) => `#00B26A`,
                strokeWidth:2
            }
        ]
    })
    const getgraphdata=async()=>{
        try{
            const jsonvalue=await AsyncStorage.getItem('data')
            let datum=jsonvalue!=null?await JSON.parse(jsonvalue):null
            // console.log("Graph data is ",data)
            console.log("working")
            console.log(datum)
            let newdata=data
            let days=[],hrs=[]
            datum.forEach(element => {
                days.push(element.day)
                hrs.push(element.hrs/3600)
            })
            newdata.labels=days
            newdata.datasets[0].data=hrs
            setData(newdata)
            console.log("Graph data after modification is ",data)
        }
        catch(error){

        }
    }
    useEffect(() => {
        getdata()
        getgraphdata()
        console.log(")))))))))))))))))))))))))))))))))))Home screen is focused", focussed)

    }, [modal, focussed])
 

    useEffect(() => {
        getgraphdata()
        let date = new Date().getDate()
        AsyncStorage.getItem('date').then((value) => {
            if (value == null) {
                AsyncStorage.setItem('date', date.toString())
                return
            }
            if (value != date.toString()) {
                AsyncStorage.setItem('date', date.toString())
                let hrs = 0
                AsyncStorage.getItem('tasks').then((value) => {
                    let data = JSON.parse(value)
                    data.forEach(element => {
                        hrs += element.timemset - element.timeleft
                        element.timeleft = element.timemset,
                            element.completed = false
                    });
                    AsyncStorage.setItem('tasks', JSON.stringify(data))
                    
                })
            }
        }).catch((error) => {

        })
    }, [])
    const openmodal = () => {
        setModal(true)
        setcontaineropacity(0.1)
    }
    const closemodal = () => {
        setModal(false)
        setcontaineropacity(1)
    }
    const setTimeforvisibility = (time) => {
        if (time>3600) {
            return (time/3600+" hrs")
        }
        else if (time>60) {
            return (time/60+" mins")
        }
        else {
            return (time+" secs")
        }
    }
    const getdata = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('tasks')
            let data = jsonValue != null ? JSON.parse(jsonValue) : null;
            console.log(data)
            if (data) {
                setTasks(data.filter(item => item.completed == false))
                setTaskscompleted(data.filter(item => item.completed)) //filter the completed tasks
            }
            else {
                setTasks([])
                setTaskscompleted([])
            }
        } catch (error) {
            console.log(error)
            Alert.alert("Error", "An error occured")
        }
    }
    useEffect(() => {
        console.log("useEffect working")
        getdata()
    }, [])
    useEffect(() => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let dateobj = new Date()
        let date = dateobj.getDate()
        let month = monthNames[dateobj.getMonth()]
        let year = dateobj.getFullYear()
        let datestr = date + " " + month + " " + year
        setDate(datestr)
    })
    const movetotask = (id) => {
        navigation.navigate('Task', {
            id: id
        })
    }
    const deleteTask = (id) => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => {
                    let newdata = tasks.filter(item => item.id != id)
                    setTasks(newdata)
                    AsyncStorage.setItem('tasks', JSON.stringify(newdata))
                } },
            ],
            { cancelable: false },
        );
    }
    const clearallcompleted=()=>{
        AsyncStorage.getItem('tasks').then((value) => {
            let data = JSON.parse(value)
            data=data.filter(item=>item.completed==false)
            AsyncStorage.setItem('tasks', JSON.stringify(data))
            getdata()
        })

    }
    const clearall=()=>{
        if(tasks.length==0){
            return
        }
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => {
                    AsyncStorage.setItem('tasks',JSON.stringify([]))
                    getdata()
                } },
            ],
            { cancelable: false },
        );
        
       
    
    }
    return (
        <View style={{ ...styles.container, opacity: containeropacity }}>
            <AddModal modalvisible={modal} close={closemodal} />
            <StatusBar backgroundColor="#00B26A" />
            
            <TouchableOpacity style={styles.add} onPress={openmodal}>
                <FontAwesome name="plus-a" size={24} color="#fff" />
            </TouchableOpacity>
            <ScrollView style={styles.Scrollcontainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.topbar} 
            // onPress={() => {
            //     // AsyncStorage.clear()
            //     // alert("Data cleared")
            //     // alert("fuck")
            //    AsyncStorage.setItem('data', JSON.stringify([
            //        {day:"Fri",hrs:0},{day:"Sat",hrs:30},{day:"Sun",hrs:80},{day:"Mon",hrs:80},{day:"Tue",hrs:280},{day:"Wed",hrs:100},{day:"Thur",hrs:0}
            //    ]))
            // }}
            >
                <MaterialIcons name="group-work" color="#00B26A" size={30} />
                
            </TouchableOpacity>
                <View style={styles.datecontainer}>
                    <Text style={styles.text1, { marginBottom: 2 }}>Today</Text>
                    <Text style={styles.text2}>{date}</Text>
                </View>
                <View style={{ marginTop: 50, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ marginBottom: 20 }}>Weekly Progress</Text>
                    <LineChart
                        data={data}
                        width={screenWidth}
                        height={220}
                        withInnerLines={false}
                        withOuterLines
                        withDots
                        chartConfig={{

                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: (opacity = 255) => 'rgba(0,0,0,0.5)',
                        }}
                    />
                </View>
                <View style={styles.cont}>
                    <View style={styles.titlecontainer}>
                        <View style={styles.row}>
                            <Text style={styles.text3}>Assigned</Text>
                            <View style={styles.badge}>
                                <Text style={styles.text4}>{tasks.length}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="clear-all" size={24} color="rgba(0,0,0,0.5)" onPress={clearall} />
                    </View>

                    {
                        tasks && tasks.length > 0 ?
                            tasks.map((item, index) => {
                                return (
                                    <TouchableOpacity style={styles.card} activeOpacity={0.5} onPress={() => movetotask(item.id)} key={index} onLongPress={()=>deleteTask(item.id)}>
                                        <View style={styles.cardcol1}>
                                            <View style={styles.cardicon}>
                                                <FontAwesome5 name="university" size={20} color="#00B26A" />
                                            </View>
                                            <View style={styles.cardcol3}>
                                                <Text style={{ ...styles.text3, textAlign: "justify" }}>{item.title}</Text>
                                                <Text style={{ ...styles.description, textAlign: "justify" }}>{item.description}

                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardcol2}>
                                            <Materialicons name="timer" size={20} color="#00B26A" />
                                            <Text style={styles.text5}>{(item.timeleft / 60).toFixed(0)} mins</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }) :
                            <View style={styles.nodata}>
                                <Entypo name="light-bulb" size={100} color="#00B26A" />
                                <Text style={{marginTop:30}}>Nothing found</Text>
                            </View>
                    }

                </View>
                <View style={styles.cont}>
                    <View style={styles.titlecontainer}>
                        <View style={styles.row}>
                            <Text style={{ ...styles.text3, color: "rgba(0,0,0,0.8)" }}>Completed</Text>
                            <View style={{ ...styles.badge, backgroundColor: "rgba(0,0,0,0.1)" }}>
                                <Text style={{ ...styles.text4, color: "rgba(0,0,0,1)" }}>{taskscompleted.length}</Text>
                            </View>
                        </View>

                        <MaterialIcons name="clear-all" size={24} color="rgba(0,0,0,0.5)" onPress={clearallcompleted} />
                    </View>

                    {
                        taskscompleted && taskscompleted.length > 0 ?
                            taskscompleted.map((item, index) => {
                                return (
                                    <TouchableOpacity key={index} style={{ ...styles.card, backgroundColor: "rgba(0,0,0,0.03)" }} activeOpacity={0.5} >
                                        <View style={styles.cardcol1}>

                                            <View style={styles.cardicon}>
                                                <FontAwesome5 name="university" size={20} color="rgba(0,0,0,0.8)" />
                                            </View>
                                            <View>
                                                <Text style={{ ...styles.text3, color: "rgba(0,0,0,0.8)" }}>{item.title}</Text>
                                                <Text style={styles.description}>
                                                    {item.description}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardcol2}>
                                            <Entypo name="check" size={20} color="#00B26A" />
                                        </View>
                                    </TouchableOpacity>
                                )
                            }) : true
                    }
                </View>
            </ScrollView>
        </View>
    )
}
export const styles = StyleSheet.create({
    nodata: {
        flex: 1,
        alignItems: "center",
        marginVertical: 50
    },
    cardcol2: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    cardcol3: {
        width: "auto",
    },
    cardcol1: {
        flexDirection: "row",
        width: "65%",
    },
    cardcontent: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",


    },
    description: {
        fontSize: 14,
        color: "rgba(0,0,0,0.5)",
        marginTop: 2,

    },
    cardicon: {
        marginRight: 8
    },
    card: {
        elevation: 0,
        width: "100%",
        backgroundColor: "rgba(234, 249, 241, 1)",
        marginTop: 10,
        borderRadius: 20,
        display: "flex",
        flexDirection: "row",
        padding: 20,
        justifyContent: "space-between",
        height: "auto"
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    badge: {
        backgroundColor: "#EAF9F1",
        width: 18,
        height: 18,
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,

    },
    titlecontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 5,
    },
    container: {
        paddingTop: 30,
        flex: 1,
        width: "100%",
        backgroundColor: '#fff',
        padding: 20,
        alignItems: "flex-start",
        justifyContent: "flex-start"

    },
    topbar: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    datecontainer: {
        marginTop: 20,
    },
    add: {
        backgroundColor: "#00B26A",
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 20,
        display: 'flex',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    },
    Scrollcontainer: {
        backgroundColor: "#fff",
        width: "100%",
    },
    text1: {
        fontSize: 14,
        color: "rgba(0,50,0,0.5)",
    },
    text2: {
        fontSize: 20,
        color: "rgba(0,0,0,0.7)",
        fontWeight: "600"
    },
    cont: {
        marginTop: 30
    },
    text3: {
        fontSize: 16,
        fontWeight: "500",
        color: "#00B26A"
    },

    text4: {
        fontSize: 12,
        color: "#00B26A"
    }
})
export default Home
const AddModal = ({ modalvisible, close }) => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [timemset, setTimemset] = useState(0)
    const [type, setType] = useState("")

    const submit = async () => {
        console.log(typeof timemset)
        let timeset = parseInt(timemset)
        console.log(typeof timeset)
        if (title == "" || description == "" || timemset == "") {
            alert("Please fill all the fields")
            return
        }

        try {
            const jsonValue = await AsyncStorage.getItem('tasks')
            let data = jsonValue != null ? JSON.parse(jsonValue) : null;
            let datatoadd = {
                id: Math.floor(Math.random() * 10000),
                title: title,
                description: description,
                timemset: timeset * 60,
                completed: false,
                timeleft: timeset * 60,
                type: type
            };
            let arr = data ? [...data, datatoadd] : [datatoadd];
            await AsyncStorage.setItem('tasks', JSON.stringify(arr))

            close()

        } catch (error) {
            Alert.alert("Error", error)
        }
    }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalvisible}

        >
            <View style={modalstyles.container}>
                <TouchableOpacity style={modalstyles.header} activeOpacity={0.7} onPress={close}>
                    <Ionicons name="md-chevron-back-outline" size={25} color="#00B26A" style={{ marginRight: 10 }} />
                    <Text style={{ ...styles.text3, fontSize: 20 }}>Add new</Text>
                </TouchableOpacity>

                <ScrollView style={modalstyles.form} showsVerticalScrollIndicator={false}>
                    <Text style={{ ...styles.text3, marginVertical: 10 }}>Title</Text>
                    <TextInput style={modalstyles.input} placeholder="Task title" value={title} onChangeText={(text) => setTitle(text)} />
                    <Text style={{ ...styles.text3, marginVertical: 10 }}>Description</Text>
                    <TextInput style={modalstyles.input} multiline numberOfLines={4} value={description} onChangeText={text => setDescription(text)} />
                    <Text style={{ ...styles.text3, marginVertical: 10 }} >Type</Text>
                    <View style={{ ...modalstyles.input, padding: 0 }}>
                        <Picker
                            style={{ color: "rgba(0,00,0,0.5)", fontSize: 14 }}
                            selectedValue={type}
                            onValueChange={(itemValue, itemIndex) => {
                                console.log(itemValue)
                                setType(itemValue)
                            }

                            }>
                            <Picker.Item label="Immediate" value="Immediate" />
                            <Picker.Item label="Office" value="Office" />
                            <Picker.Item label="Household" value="Household" />
                            <Picker.Item label="studies" value="studies" />
                            <Picker.Item label="goal" value="goal" />
                        </Picker>
                    </View>
                    <Text style={{ ...styles.text3, marginVertical: 10 }} >Time</Text>
                    <TextInput style={modalstyles.input} placeholder="Time in minutes" keyboardType="number-pad" value={timemset} onChangeText={text => setTimemset(text)} />
                    <TouchableOpacity style={modalstyles.button} activeOpacity={0.8} onPress={submit}>
                        <Text style={{ ...styles.text3, color: "white" }}>Add</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

        </Modal>
    )
}
export const modalstyles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        borderRadius: 10,
        fontSize: 14,
        padding: 10,
        color: "rgba(0,0,0,0.7)",
    },
    button: {
        backgroundColor: "#00B26A",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        marginTop: 50,
        marginBottom: 50
    },
    form: {
        padding: 30,
        marginTop: 10,
    },
    container: {
        height: '80%',
        marginTop: 'auto',
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "green",
        elevation: 10

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    }

})
