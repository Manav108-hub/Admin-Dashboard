import axios from 'axios';

const B2_APPLICATION_KEY_ID = process.env.B2_APPLICATION_KEY_ID || 'f91d87c516dd';
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY || '003ab1f0d85b75620c142997c458516faa3e1ee4d3';

const getB2Auth = async () => {
  try {
    console.log('Attempting to authenticate with B2...');
    const authResponse = await axios({
      method: 'get',
      url: 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      headers: {
        Authorization: `Basic ${btoa(`${B2_APPLICATION_KEY_ID}:${B2_APPLICATION_KEY}`)}`,
        Accept: '*/*'
      },
      timeout: 10000
    });
    console.log('Authentication successful:', authResponse.data);
    return {
      authorizationToken: authResponse.data.authorizationToken,
      apiUrl: authResponse.data.apiUrl,
      downloadUrl: authResponse.data.downloadUrl
    };
  } catch (error) {
    console.error('Error authenticating with Backblaze B2:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      if (error.response) console.error('Response:', error.response.data);
      else if (error.request) console.error('Request:', error.request);
    }
    throw error;
  }
};

// Test it
getB2Auth().then(console.log).catch(console.error);