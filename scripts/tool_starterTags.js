function mainStarterTags() {
    let envObj = getEnvironment(document.getElementById('starter-tags-environment-select').value);
    let serviceRule = {
        "name": "Service",
        "rules": [{
            "type": "SERVICE",
            "enabled": true,
            "valueFormat": "{Service:DetectedName}",
            "propagationTypes": [],
            "conditions": [{
                "key": {
                    "attribute": "SERVICE_DETECTED_NAME"
                },
                "comparisonInfo": {
                    "type": "STRING",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let processRule = {
        "name": "Process",
        "rules": [{
            "type": "PROCESS_GROUP",
            "enabled": true,
            "valueFormat": "{ProcessGroup:DetectedName}",
            "propagationTypes": [],
            "conditions": [{
                "key": {
                    "attribute": "PROCESS_GROUP_NAME"
                },
                "comparisonInfo": {
                    "type": "STRING",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let hostRule = {
        "name": "Host",
        "rules": [{
            "type": "HOST",
            "enabled": true,
            "valueFormat": "{Host:DetectedName}",
            "propagationTypes": [],
            "conditions": [{
                "key": {
                    "attribute": "HOST_NAME"
                },
                "comparisonInfo": {
                    "type": "STRING",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let databaseRule = {
        "name": "Database",
        "rules": [{
            "type": "SERVICE",
            "enabled": true,
            "valueFormat": null,
            "propagationTypes": [],
            "conditions": [{
                    "key": {
                        "attribute": "SERVICE_TYPE"
                    },
                    "comparisonInfo": {
                        "type": "SERVICE_TYPE",
                        "operator": "EQUALS",
                        "value": "DATABASE_SERVICE",
                        "negate": false
                    }
                },
                {
                    "key": {
                        "attribute": "SERVICE_DATABASE_NAME"
                    },
                    "comparisonInfo": {
                        "type": "STRING",
                        "operator": "EXISTS",
                        "value": null,
                        "negate": false,
                        "caseSensitive": null
                    }
                }
            ]
        }]
    }
    let IPRule = {
        "name": "IP",
        "rules": [{
            "type": "HOST",
            "enabled": true,
            "valueFormat": "{Host:IpAddress}",
            "propagationTypes": [
                "HOST_TO_PROCESS_GROUP_INSTANCE"
            ],
            "conditions": [{
                "key": {
                    "attribute": "HOST_IP_ADDRESS"
                },
                "comparisonInfo": {
                    "type": "IP_ADDRESS",
                    "operator": "EXISTS",
                    "value": null,
                    "negate": false,
                    "caseSensitive": null
                }
            }]
        }]
    }
    let settings = {
        "url": envObj['URL'] + "/api/config/v1/autoTags",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Authorization": "Api-Token " + envObj['TOK'],
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(serviceRule),
    };

    $.ajax(settings).done(function (response) {
        document.getElementById('starter-tags-table').innerHTML += '<tr><td>Service:{Detected Name}</td><td>Successful</td></tr>';
        settings['data'] = JSON.stringify(processRule);
        $.ajax(settings).done(function (response) {
            document.getElementById('starter-tags-table').innerHTML += '<tr><td>Process:{Detected Name}</td><td>Successful</td></tr>';
            settings['data'] = JSON.stringify(hostRule);
            $.ajax(settings).done(function (response) {
                document.getElementById('starter-tags-table').innerHTML += '<tr><td>Host:{Detected Name}</td><td>Successful</td></tr>';
                settings['data'] = JSON.stringify(databaseRule);
                $.ajax(settings).done(function (response) {
                    document.getElementById('starter-tags-table').innerHTML += '<tr><td>Database:{Detected Name}</td><td>Successful</td></tr>';
                    settings['data'] = JSON.stringify(IPRule);
                    $.ajax(settings).done(function (response) {
                        document.getElementById('starter-tags-table').innerHTML += '<tr><td>IP:{HostIP}</td><td>Successful</td></tr>';
                    });
                });
            });
        });
    });
}