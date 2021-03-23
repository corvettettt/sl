import {WORLD_MAP_URL,SAT_API_KEY,SATELLITE_POSITION_URL} from "../constants";
import React, { Component } from "react";
import axios from "axios";
import { Spin } from "antd";
import { feature } from "topojson-client";
import { geoKavrayskiy7 } from "d3-geo-projection";
import { geoGraticule, geoPath } from "d3-geo";
import { select as d3Select } from "d3-selection";
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";


const height = 600;
const width = 960;

class WorldMap extends Component {
    constructor() {
        super();
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
        this.state = {
            isLoading :false,
            isDrawing: false
        }
        this.map = null
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
    }
    componentDidMount(){
        axios.get(WORLD_MAP_URL).then( res=>{
            console.log(res);
            const {data} = res;
            const land = feature(data,data.objects.countries).features;
            //console.log(land)
            this.generateMap(land);
        }).catch(err=>{
            console.log(err)
        })


    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData!==this.props.satData){
            const{latitude,
                  longitude,
                  elevation,
                  altitude,
                  duration} = this.props.observeData

            const endTime = duration * 60;

            this.setState({
                isLoading:true
            });

            //step1 : prepare for urls
            const urls = this.props.satData.map(sat=>{
                const {satid} = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${altitude}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            })
            //console.log("url -> ",urls)

            //step2: fetch sats positions
            // axios.all(urls)
            //     .then(axios.spread((...args)=>{
            //         return args.map(item => item.data)
            //     }))//扁平化之后获得data
            //     .then(response=>{
            //         console.log('response=>' ,response)
            //     }).catch(err=>{
            //         console.log(err)
            //         })
            Promise.all(urls) //这里的Promise那里来的
                .then(results=>{
                    console.log('->',results);
                    const arr = results.map(sat=>sat.data);
                    this.setState({
                        isLoading:false,
                        isDrawing:true
                    })
                    //case 1 : is not Drawing - > track
                    //case 2 : is Drawing     - > don' track
                    if (!prevState.isDrawing){
                        console.log(arr)
                        this.track(arr)
                    }else{
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";

                    }
                }).catch(err=>{
                    console.log(err)
                })
        }
    }

    track = data=>{
        if (!data[0] || !data[0].hasOwnProperty('positions')){
            throw new Error("no position data");
            return;
        }
        const len = data[0].positions.length;//一个卫星轨迹的个数
        const {duration} = this.props.observeData;
        const {context2} = this.map;

        let now = new Date();
        let i = 0;
        let timer = setInterval(()=>{
            let ct = new Date()
            let timePassed =i ===0 ? 0:ct - now;
            let time = new Date(now.getTime() +60* timePassed)

            context2.clearRect(0,0,width,height);  // ?????

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333"
            context2.textAlign = "center"
            context2.fillText(d3TimeFormat(time),width/2,10);

            if (i>=len){
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;

            }

            data.forEach(sat=>{
                const {info,positions} = sat;
                this.drawSat(info,positions[i])
            })
            console.log(i)
            i+=60;
        },1000)


    }

    generateMap = land=>{
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width/2, height/2])
            .precision(0.1);
        //console.log(projection)
        const graticule = geoGraticule();

        const canvas = d3Select(this.refMap.current) //通过ref下的current获得该ref
            .attr("width",width)
            .attr("height",height);

        const canvas2 = d3Select(this.refTrack.current)
            .attr("width",width)
            .attr("height",height);

        const context = canvas.node().getContext("2d")
        const context2 = canvas2.node().getContext("2d")

        let path = geoPath().projection(projection).context(context) //context是设置画板

        land.forEach(ele => {
            context.fillStyle = '#B3DDEF';//大陆的颜色
            context.strokeStyle = '#000'; //画笔颜色//board color
            context.globalAlpha = 0.7;//透明度
            context.beginPath();//开始画图
            path(ele); //之前定义的方法 L43
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })

        this.map = {
            context:context,
            context2:context2,
            projection: projection
        }
    }

    drawSat = (sat,pos) =>{
        const {satlongitude,satlatitude} = pos;
        if (!satlongitude ||!satlatitude){
            return
        }
        const {satname} = sat;
        const name = satname.match(/\d+/g).join("");

        const {projection, context2} = this.map;
        const xy = projection([satlongitude,satlatitude])
        context2.fillStyle = this.color(name);
        context2.beginPath();
        context2.arc(xy[0],xy[1],4,0,2*Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(name,xy[0],xy[1]+10);

    }



    render() {
        return (
            <div className="map-box">
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack}/>
                <div className="hint"/>
            </div>
        );
    }
}

export default WorldMap;

//react-simple-map