import React, {Component} from 'react';
import {DragAndDropButton} from "./DragAndDropButton";
import {AddNodeDialog} from "./AddNodeDialog";
import {NodeGrid} from "./NodeGrid";
import ArrowBack from "@material-ui/icons/ArrowBack";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

export default class Manage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            addValue: "",
            nodes: [],
            dialogOpen: false
        };
    }

    componentDidMount() {
        let _this = this;

        fetch(this.getUrl('api/node/nodes'), {
            method: "GET",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then((response => {return response.json()}))
        .then(function (response) {
            let nodes = response.data.attributes.result
            console.log('nodes:', nodes)
            _this.setState({nodes})
        })
    }

    render() {
        const {nodes, dialogOpen} = this.state;
        return (
            <div>
                <AppBar position="fixed" color="inherit">
                    <Toolbar>
                        <IconButton edge="start" aria-label="back"
                                    onClick={() => history.back()}>
                            <ArrowBack/>
                        </IconButton>
                        <Typography variant="h6"
                                    style={{marginLeft: 12, flex: 1}}>
                            Nodes
                        </Typography>
                        <DragAndDropButton
                            onClick={this.onAddNodeClick}
                            onConfigLoaded={this.onConfigLoaded}/>
                    </Toolbar>
                </AppBar>
                <Container style={{marginTop: 84}}>
                    <NodeGrid list={nodes} onView={this.onView}
                              onDismiss={this.onDismiss}/>
                </Container>
                <AddNodeDialog open={dialogOpen}
                               onSubmit={this.onSubmit}
                               onCancel={this.onCancel}/>
            </div>
        )
    }

    onAddNodeClick = (e) => {
        e.stopPropagation();
        this.setState({dialogOpen: true})
    };

    onConfigLoaded = (nodes) => {
        console.log("Nodes successfully loaded:", nodes);
        if (nodes != null && nodes.length > 0) {
            config.nodes.forEach((node) => {
                this.onSubmit(node)
            })
        }
    };

    onCancel = () => {
        this.setState({dialogOpen: false})
    };

    onSubmit = (newNode) => {
        this.setState({dialogOpen: false});
        fetch(this.getUrl("api/node/add"), {
            method: "POST",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newNode)
        }).then(response => {
            console.log('add response:', response)
            if (response.status === 201) {
                console.log("Success:", response.status, response.statusText);
                this.setState((prevState) => {
                    const {nodes} = prevState;
                    let newNodes = [...nodes, newNode];
                    return {
                        ...prevState,
                        nodes: newNodes
                    }
                })
            } else {
                console.log("Error:", response.status, response.statusText);
            }
        })
    };

    onView = (node) => {
        fetch(this.getUrl("api/node/url"), {
            method: "POST",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(node)
        }).then(response => {
            if (response.status === 200) {
                console.log("Success:", response.status, response.statusText);
                window.location = "/";
            } else {
                console.log("Error:", response.status, response.statusText);
            }
        })
    };

    getUrl = (path) => {
        let {host, protocol} = window.location;
        if (host === "localhost:7999") {
            // when running webpack dev server, point urls to 8080
            host = "localhost:8080";
        }
        return `${protocol}//${host}/${path}`;
    };

    onDismiss = (nodeToRemove) => {
        fetch(this.getUrl("api/node/remove"), {
            method: "POST",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nodeToRemove)
        }).then(response => {
            console.log('remove response:', response)
            if (response.status === 204) {
                console.log("Success:", response.status, response.statusText);
                this.setState((prevState) => {
                    const {nodes} = prevState;
                    let newNodes = nodes.filter((node) => node !== nodeToRemove);
                    return {
                        ...prevState,
                        nodes: newNodes
                    }
                })
            } else {
                console.log("Error:", response.status, response.statusText);
            }
        })
    }
}
