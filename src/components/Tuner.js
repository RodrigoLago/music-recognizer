import React, { useEffect } from "react"
import { Button, StyleSheet, View, Text } from 'react-native';


const Tuner = () => {

    const styles = StyleSheet.create({
        btn: {
            width: '100%',
            borderRadius: 70,
    
        },
        btndv: {
            margin: '10%',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
        },
        view: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        txt: {
            fontSize: 20,
            color: '#fff'
        }
    })

    return (
        <React.Fragment>
            <View style={styles.view}>
                <Text style={styles.txt}>Tuner</Text>
                <View style={styles.btndv}>
                    <Button style={styles.btn} title="Guitar Tuner" type="solid" color="#7c1a38" onPress={() => alert("tuner")} />
                </View>
            </View >
        </React.Fragment>
    )
}
export default Tuner;
    