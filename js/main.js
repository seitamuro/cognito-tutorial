const poolData = {
  UserPoolId: "us-east-1_2IeTcSA7d",
  ClientId: "2hvk7stfr121mkpn1l2dplbk58",
};

function SignUp() {
  var username = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  userPool.signUp(username, password, [], null, (err, result) => {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    var cognitoUser = result.user;
    console.log("user name is " + cognitoUser.getUsername());
    window.location.href = "confirm.html";
  });
}

function ConfirmRegistration() {
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var username = document.getElementById("email").value;
  var code = document.getElementById("confirmationCode").value;
  var userData = {
    Username: username,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmRegistration(code, true, function (err, result) {
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    console.log("call result: " + result);
    window.location.href = "login.html";
  });
}

function LoginUser() {
  var username = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  var authenticationData = {
    Username: username,
    Password: password,
  };

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
    Username: username,
    Pool: userPool,
  };

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      var idToken = result.getIdToken().getJwtToken();
      var accessToken = result.getAccessToken().getJwtToken();
      var refreshToken = result.getRefreshToken().getToken();

      console.log("idToken: " + idToken);
      console.log("accessToken: " + accessToken);
      console.log("refreshToken: " + refreshToken);

      AWS.config.region = "us-east-1";

      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:90182fab-a91b-4774-83e0-a81e47a60d1f",
        Logins: {
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_2IeTcSA7d": result
            .getIdToken()
            .getJwtToken(),
        },
      });

      AWS.config.credentials.refresh((error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Successfully logged!");
        }
      });
    },
    onFailure: function (err) {
      alert(err.message || JSON.stringify(err));
    },
  });
}
