import React from 'react';
import { Text, View } from 'react-native';
import { testProps } from '../config';

const App = () => {
    return (
        <View>
            <Text {...testProps('app-harness-home-screen-intro-text')}>ReNative Harness</Text>
            <Text>{`hermes: ${typeof HermesInternal === 'object' && HermesInternal !== null ? 'yes' : 'no'}`}</Text>
        </View>
    );
};

export default App;
