import React, {Component} from 'react';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import {NEARBY_SATELLITE, STARLINK_CATEGORY,SAT_API_KEY} from "../constants";
import axios from 'axios'
import WorldMap from "./WorldMap";

class Main extends Component {
    state = {
        satInfo:null,
        settings:null,
        satList:null,
        isLoadingList:false
    }
    render() {
        const {satInfo,isLoadingList,settings,satList} = this.state;
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList satInfo={satInfo}
                                    isLoading={isLoadingList}
                                    onShowMap={this.showMap}/>
                </div>
                <div className="right-side">
                    <WorldMap satData={satList} observeData={settings}/>
                </div>
            </div>
        );
    }

    showMap = (selected)=> {
        this.setState({
            satList: [...selected]
        })//satList的copy，shadowCopy

    }
    showNearbySatellite = setting =>{
        console.log('setting ->', setting);
        this.setState({settings:setting});
        this.fetchSatellite(setting);
    }
    fetchSatellite = setting=>{
        //fetch date from N2YO
        // step1: get setting values

        const {latitude,longitude,elevation,altitude} = setting;

        //step2: prepare the url
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        this.setState({isLoadingList : true});


        //step3: make ajax call
        axios.get(url).then(response=>{
            console.log(response)
            this.setState({satInfo: response.data,
                                isLoadingList:false});
        }).catch(err=>{
            console.log('error in fetch satellite list -> ',err);
            this.setState({isLoadingList:false})
        })



    }
}

export default Main;
//npm install --save topojson-client //将top数据转化为GEOjson
//npm install --save d3-geo          //画地图，并且加上经纬线
//npm install --save d3-geo-projection // d3 的拓展
//npm install --save d3-selection      //地图数据