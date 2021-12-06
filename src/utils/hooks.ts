import {useContext} from 'react';
import {Store} from "../App";


const useStore = ()=>{
    return useContext(Store);
}


export {useStore}