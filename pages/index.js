import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';
import getConfig from 'next/config';

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const Home = () => {
  const maxRetries = 5;
  const [input, setInput] = useState('');
  const [img, setImg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const { publicRuntimeConfig } = getConfig();

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const generateAction = async () => {
    console.log('Generating...');

    let retryCount = maxRetries;

    if (isGenerating) {
      return;
    }

    setIsGenerating(true);

    do {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg'
        },
        body: JSON.stringify({input})
      });

      const data = await response.json();

      if (response.status === 503) {
        console.log('Model is still loading :(.');
        await sleep(data.estimated_time * 1000);
        continue;
      }

      if (!response.ok) {
        console.log(`Error: ${data.error}`);
        break;
      } else {
        setFinalPrompt(input);
        setInput('');
        setImg(data.image);
        setIsGenerating(false);
        break;
      }
    } while (retryCount-- > 0);

    if (retryCount == 0) {
      console.log('Looks like you might have to try later.');
    }
  }

  return (
    <div className="root">
      <Head>
        <title>AI Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>AI picture generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Turn me into anyone you want! Make sure you refer to me as {publicRuntimeConfig.MODEL_NAME} in the prompt</h2>
          </div>
          <div className="prompt-container">
            <input className="prompt-box" value={input} onChange={onChange}/>
            <div className="prompt-buttons">
              <a className={
                    isGenerating ? 'generate-button loading' : 'generate-button'
                 } 
                 onClick={generateAction}>
                <div className="generate">
                  <p>Generate</p>
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
