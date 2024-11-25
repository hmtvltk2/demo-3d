import { UserManager } from 'oidc-client-ts';
import { onMounted } from 'vue';

export function useLogin() {
    const settings = {
        authority: 'https://sso.hcmgis.vn/oauth2/token',
        client_id: 'K1FTx1PfZTJPCzpl8tf4DEtYAe4a',
        redirect_uri: 'https://demo-3dcity.hcmgis.vn/callback',

        response_type: 'code',
        scope: 'openid profile email',
    };

    const userManager = new UserManager(settings);

    // Redirect user to login
    function login() {
        userManager.signinRedirect();
    }

    // Handle the callback
    async function handleCallback() {
        const user = await userManager.signinRedirectCallback();
        console.log('User Info:', user.profile);
        console.log('Access Token:', user.access_token);
    }

    onMounted(() => {
        // Example usage
        if (window.location.pathname === '/callback') {
            handleCallback();
        }
    })


    return { login }
}

