import React, {Component} from 'react';
import {List, Button,Checkbox,Avatar, Spin } from 'antd';//Spin用作加载的时候的图标
import satellite from "../assets/images/satelite.svg";

class SatelliteList extends Component {
    // constructor(){
    //     super();
    //     this.state = {
    //         selected :[],
    //         isLoad:false;
    //
    // }

    state = {
        selected :[],
        isLoad:false
    }

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];

        const {isLoading} = this.props; //解构

        return (
            <div className="sat-list-box">
                    <Button className="sat-list-btn"
                            type="primary"
                            size="large"
                            onClick={this.onShowSatMapStatus}>Track on the map</Button>
                <hr/>

                {
                    isLoading
                    ?
                    <div className="spin-box">
                        <Spin size = "large" tip ="loading..."></Spin>
                    </div>
                    :
                    <List className="sat-list"
                        itemLayout="horizontal"
                           dataSource={satList}
                           renderItem={
                               item=>
                                   <List.Item//loop over all item in the render content//List的API
                                       actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}>
                                        <List.Item.Meta
                                            avatar = {<Avatar src ={satellite} size = {50}/>}
                                            title  = {<p>{item.satname}</p>}
                                            description ={`Launch Data: ${item.launchDate}`}
                                        />
                                   </List.Item>
                           }
                    /> }
            </div>
        );
    }

    onShowSatMapStatus = ()=>{
        this.props.onShowMap(this.state.selected)
    }

    onChange =  e=>{
        //console.log("selected checkbox",e.target); // 通过target获取数据
        //console.log("data->",e.target.dataInfo);
        //step1 : get current selected satellite
        const {dataInfo,checked} = e.target;
        const {selected} = this.state;
        //step2 :  add or remove current sat to/from selected array
        const list = this.addOrRemove(dataInfo,checked,selected)
        //step3 : update selected state
        this.setState(
            {selected:list}
        )
        //console.log(list);
    }

    addOrRemove = (item,status,list) =>{
        // case 1 : check if is true
        //      -> item is not in the list : add the item
        //      -> item is in the list : nothing
        // case 2 : if is false
        //      -> item is in the list : remove the item
        //      -> item is not in the list : nothing

        const found = list.some(entry=>entry.satid===item.satid);

        if (status && !found) {
            list = [...list, item];
            //list.push(item)
        } else if (!status && found){
            list = list.filter(entry => entry.satid !== item.satid);
        }
        return list;
    }
}

export default SatelliteList;
