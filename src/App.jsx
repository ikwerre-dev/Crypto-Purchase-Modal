import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import MainForm from './sections/MainForm';
import './App.css';
import { Bitcoin, CoinsIcon } from 'lucide-react';

function App() {

  return (
    <>
      <div className="bg-white  p-4 
                      w-full h-[45rem] md:w-[30rem] mx-auto text-left 
                      mt-20 rounded-[2rem] shadow-xl">
        <div className="px-5 pt-4 pb-1 flex gap-2">
          <CoinsIcon className='text-blue-500' style={{color : ''}} />
          <h6 className="text-l text-blue-500 font-semibold">BuyBitcoin.<span className="font-bold">com</span></h6>
        </div>
        <MainForm />
      </div>
    </>
  );
}

export default App;
