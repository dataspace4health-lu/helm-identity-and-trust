Create did using a POST request to end point /onboard/issuer, with boby:

```
{
  "key": {
    "backend": "tse",
    "keyType": "Ed25519",
    "config": {
      "server": "http://issuer-vault-server-headless.default.svc.cluster.local/v1/transit",
      "auth": {
        "accessKey": "root"
      }
    }
  },
  "did": {
    "method": "web"
  }
}
```