import React, {Component} from "react";
import {Form,Button, InputNumber} from "antd";

class SatSettingForm extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        const formItemLayout = {
            labelCol:{
                xs:{span:24},
                sm:{span:11},

            },
            wrapperCol:{
                xs:{span:24},
                sm:{span:13}
            }
        }
        return (
            <Form {...formItemLayout} onSubmit={this.ShowSatellite} className="sat-setting">
                <Form.Item label="Longitude(degree):">
                    {
                        getFieldDecorator('longitude', {
                            rules: [
                                {
                                    required: true,
                                    message: 'please input your Longitude'
                                }
                            ],
                        })(<InputNumber min={-180} max={180}
                                        placeholder="please input longitude"
                                        style={{width: "100%"}}/>)
                    }
                </Form.Item>
                <Form.Item label="Latitude(degree):">
                    {
                        getFieldDecorator('latitude',{
                            rules:[
                                {
                                    required : true,
                                    message : 'please input your Latitude'
                                }
                            ],
                        })(<InputNumber min={-90} max = {90}
                                 placeholder="please input Latitude"
                                 style = {{width:"100%"}}/>)
                    }
                </Form.Item>

                <Form.Item label="Elevation(meters)">
                    {
                        getFieldDecorator("elevation", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Elevation",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Elevation"
                                        min={-413} max={8850}
                                        style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Altitude(degrees)">
                    {
                        getFieldDecorator("altitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Altitude",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Altitude"
                                        min={0} max={90}
                                        style={{width: "100%"}}
                        /> )
                    }
                </Form.Item>

                <Form.Item label="Duration(secs)">
                    {
                        getFieldDecorator("duration", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Duration",
                                }
                            ],
                        })(<InputNumber placeholder="Please input Duration" min={0} max={90} style={{width: "100%"}} />)
                    }
                </Form.Item>

                <Form.Item className="show-nearby">
                    <Button type="primary" htmlType="submit" style={{textAlign:"center"}}>
                        Find Nearby Satellite
                    </Button>
                </Form.Item>
            </Form>
        );
    }

    ShowSatellite=(e)=>{
        e.preventDefault();
        console.log("clicked");
        this.props.form.validateFields((err,values)=>{
            if (!err){
                console.log(values);
                this.props.onShow(values);
            }
        })
    }
}

const SetSetting = Form.create({name:'satellite-setting'})(SatSettingForm);
export default SetSetting;