import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-toastify';
import axios from 'axios';

const cryptos = [
  { symbol: 'BTC', name: 'Bitcoin', color: 'bg-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', color: 'bg-blue-500' },
  { symbol: 'USDT', name: 'Tether', color: 'bg-green-500' },
  { symbol: 'BNB', name: 'Binance Coin', color: 'bg-yellow-500' },
  { symbol: 'XRP', name: 'Ripple', color: 'bg-black' },
];

const paymentMethods = [
  { name: "Credit Card", providers: ['simplex'] },
  { name: "Debit Card", providers: ['simplex', 'wyre'] },
];

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [billingDetails, setBillingDetails] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [loading, setLoading] = useState(false); // Add loading state

  const handleExpiryChange = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format as MM/YY
    let formattedDate = '';
    if (digits.length > 0) {
      formattedDate += digits.slice(0, 2); // MM
    }
    if (digits.length > 2) {
      formattedDate += '/' + digits.slice(2, 4); // /YY
    }

    setBillingDetails({ ...billingDetails, expiryDate: formattedDate });
  };


  const [modalStates, setModalStates] = useState({
    isModalOpen: false,
    isPaymentMethodModalOpen: false,
    isKeypadModalOpen: false,
    isScannerOpen: false,
    isCurrencyModalOpen: false,
    initiatePaymentModal: false,
  });

  const openModal = (modalName) => setModalStates(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModalStates(prev => ({ ...prev, [modalName]: false }));

  const handleScan = (data) => {
    if (data) {
      setWalletAddress(data[0].rawValue);
      closeModal('isScannerOpen');
    }
  };

  const handleError = (err) => {
    console.error(err);
    alert('Error: ' + err);
  };

  const getQuote = () => {
    if (amount < 10) {
      toast("At least a minimum of $10 is needed!");
      return;
    }
    if (walletAddress.length < 5) {
      toast("Invalid Beneficiary Wallet address!");
      return;
    }
    openModal('isPaymentMethodModalOpen');
  };

  const handleKeyPress = (key) => {
    setAmount(prev => {
      if (key === 'backspace') return prev.slice(0, -1);
      if (key === '.' && prev.includes('.')) return prev;
      return prev + key;
    });
  };

  const handleSubmitCardDetails = async () => {
    setLoading(true); // Set loading to true
    console.log(billingDetails)

    try {
      const response = await axios.post('https://horizontrade.online/buycrypto.php', {
        walletAddress,
        amount,
        currency: selectedCurrency,
        selectedCrypto: selectedCrypto.symbol,
        billingAddress: billingDetails,
      });

      if (response.data.status === 'success') {
        toast.warning(response.data.message || "Payment successful!");
        closeModal('initiatePaymentModal');
      } else {
        toast.error(response.data.message || "Payment failed! Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed! Please try again.");
    } finally {
      setLoading(false); // Reset loading state after API call
    }
  };

  const completeKeypad = () => {
    setAmount(parseFloat(amount).toFixed(2));
    closeModal('isKeypadModalOpen');
  };

  const renderInputFields = () => {
    if (selectedMethod === 'Credit Card' || selectedMethod === 'Debit Card') {
      return (
        <>
          <InputField label="Card Number" value={billingDetails.cardNumber} onChange={(value) => setBillingDetails({ ...billingDetails, cardNumber: value })} />
          <div className="flex space-x-2">
            <InputField label="Expiry Date (MM/YY)" value={billingDetails.expiryDate} onChange={handleExpiryChange} />
            <InputField label="CVV" value={billingDetails.cvv} onChange={(value) => setBillingDetails({ ...billingDetails, cvv: value })} />
          </div>
          <InputField label="Cardholder Name" value={billingDetails.cardholderName} onChange={(value) => setBillingDetails({ ...billingDetails, cardholderName: value })} />
          <h3 className="mt-4 font-semibold">Billing Address</h3>
          <InputField label="Street Address" value={billingDetails.address} onChange={(value) => setBillingDetails({ ...billingDetails, address: value })} />
          <div className="flex space-x-2">
            <InputField label="City" value={billingDetails.city} onChange={(value) => setBillingDetails({ ...billingDetails, city: value })} />
            <InputField label="State" value={billingDetails.state} onChange={(value) => setBillingDetails({ ...billingDetails, state: value })} />
          </div>
          <InputField label="ZIP Code" value={billingDetails.zip} onChange={(value) => setBillingDetails({ ...billingDetails, zip: value })} />
          <InputField label="Phone Number" value={billingDetails.phone} onChange={(value) => setBillingDetails({ ...billingDetails, phone: value })} />
          <InputField label="Email Address" type="email" value={billingDetails.email} onChange={(value) => setBillingDetails({ ...billingDetails, email: value })} />
        </>
      );
    } else if (selectedMethod === 'Bank Transfer') {
      return (
        <>
          <InputField label="Account Number" />
          <InputField label="Routing Number" />
          <InputField label="Account Holder Name" />
        </>
      );
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto p-4 font-sans h-100 grid relative overflow-hidden">
      <div className="relative p-2 h-[40rem]">
        <h2 className="text-l font-semibold mb-2">Select Preferred Crypto <span className="text-blue-500">*</span></h2>
        <CryptoSelection selectedCrypto={selectedCrypto} onSelectCrypto={setSelectedCrypto} openModal={openModal} />

        <h2 className="text-l font-semibold mb-2">Amount <span className="text-blue-500">*</span></h2>
        <AmountInput amount={amount} openModal={openModal} selectedCurrency={selectedCurrency} onSelectCurrency={setSelectedCurrency} />

        <h2 className="text-l font-semibold mb-2">Wallet Address <span className="text-blue-500">*</span></h2>
        <WalletAddressInput walletAddress={walletAddress} setWalletAddress={setWalletAddress} openScanner={() => openModal('isScannerOpen')} />

        {modalStates.isScannerOpen && (
          <ScannerModal onClose={() => closeModal('isScannerOpen')} onScan={handleScan} onError={handleError} />
        )}

        <button onClick={getQuote} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold">GET QUOTE</button>

        {/* Crypto Modal */}
        {modalStates.isModalOpen && (
          <Modal title="Select Cryptocurrency" onClose={() => closeModal('isModalOpen')}>
            <div className="space-y-2">
              {cryptos.map((crypto) => (
                <CryptoOption
                  key={crypto.symbol}
                  crypto={crypto}
                  onSelect={() => {
                    setSelectedCrypto(crypto);
                    closeModal('isModalOpen');
                  }}
                />
              ))}
            </div>
          </Modal>
        )}

        {/* Payment Method Modal */}
        {modalStates.isPaymentMethodModalOpen && (
          <Modal title="Select Payment Method" onClose={() => closeModal('isPaymentMethodModalOpen')}>
            <PaymentMethodSelection
              paymentMethods={paymentMethods}
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
              onContinue={() => openModal('initiatePaymentModal')}
            />
          </Modal>
        )}

        {/* Bank Details Modal */}
        {modalStates.initiatePaymentModal && (
          <Modal title={`Enter ${selectedMethod} details`} onClose={() => closeModal('initiatePaymentModal')}>
            <div className="space-y-2 mt-[2rem]">
              {renderInputFields()}
            </div>
            <button
              onClick={handleSubmitCardDetails}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg font-semibold ${loading ? 'opacity-50' : ''}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Payment'}
            </button>
          </Modal>
        )}

        {/* Keypad Modal */}
        {modalStates.isKeypadModalOpen && (
          <Modal title="Enter Amount" onClose={() => closeModal('isKeypadModalOpen')}>
            <Keypad amount={amount} onKeyPress={handleKeyPress} onContinue={completeKeypad} />
          </Modal>
        )}

        {/* Currency Modal */}
        {modalStates.isCurrencyModalOpen && (
          <Modal title="Select Currency" onClose={() => closeModal('isCurrencyModalOpen')}>
            <CurrencySelection selectedCurrency={selectedCurrency} onSelectCurrency={setSelectedCurrency} />
          </Modal>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, type = 'text', value, onChange }) => (
  <div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
      placeholder={label}
    />
  </div>
);

const CryptoSelection = ({ selectedCrypto, onSelectCrypto, openModal }) => (
  <div className="bg-gray-100 rounded-lg p-4 mb-5 flex items-center justify-between cursor-pointer" onClick={() => openModal('isModalOpen')}>
    <div className="flex items-center">
      <div className={`${selectedCrypto.color} text-white rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
        {selectedCrypto.symbol[0]}
      </div>
      <span className="font-semibold">{selectedCrypto.name} ({selectedCrypto.symbol})</span>
    </div>
    <ChevronRight className="text-gray-400" />
  </div>
);

const AmountInput = ({ amount, openModal, selectedCurrency, onSelectCurrency }) => (
  <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between">
    <input
      type="text"
      value={`$${amount || '0.00'}`}
      onClick={() => openModal('isKeypadModalOpen')}
      readOnly
      className="bg-transparent text-xl font-semibold w-full outline-none"
    />
    <div className="flex items-center">
      <button onClick={() => openModal('isCurrencyModalOpen')} className="flex items-center text-blue-500">
        <span className="mr-2 bg-blue-200 p-2 rounded-lg font-bold text-xs">{selectedCurrency}</span>
        <ChevronRight className="text-gray-400" />
      </button>
    </div>
  </div>
);

const WalletAddressInput = ({ walletAddress, setWalletAddress, openScanner }) => (
  <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-between">
    <input
      type="text"
      value={walletAddress}
      onChange={(e) => setWalletAddress(e.target.value)}
      className="bg-transparent text-l font-semibold w-full outline-none"
      placeholder="Enter wallet address"
    />
    <button onClick={openScanner} className="ml-2 text-gray-500">
      <Camera size={24} />
    </button>
  </div>
);

const ScannerModal = ({ onClose, onScan, onError }) => (
  <div className="absolute inset-0 z-50 bg-white p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">Scan QR Code</h3>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={24} />
      </button>
    </div>
    <Scanner onScan={onScan} onError={onError} allowMultiple scanDelay={3000} />
  </div>
);

const CryptoOption = ({ crypto, onSelect }) => (
  <div
    className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center"
    onClick={onSelect}
  >
    <div className={`${crypto.color} text-white rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
      {crypto.symbol[0]}
    </div>
    <span>{crypto.name} ({crypto.symbol})</span>
  </div>
);

const PaymentMethodSelection = ({ paymentMethods, selectedMethod, onSelectMethod, onContinue }) => (
  <div className="space-y-2 mt-[2rem]">
    {paymentMethods.map((method) => (
      <PaymentMethod
        key={method.name}
        name={method.name}
        providers={method.providers}
        isSelected={selectedMethod === method.name}
        onClick={() => {
          onSelectMethod(method.name);
          onContinue();
        }}
      />
    ))}
  </div>
);

const Keypad = ({ amount, onKeyPress, onContinue }) => (
  <div>
    <div className="text-center mb-6">
      <div className="text-4xl font-bold mb-1">${amount || '0.00'}</div>
      <div className="text-gray-500">Amount</div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace'].map((key) => (
        <button
          key={key}
          className="bg-gray-100 rounded-lg p-4 text-center text-xl font-semibold"
          onClick={() => onKeyPress(key.toString())}
        >
          {key === 'backspace' ? '⌫' : key}
        </button>
      ))}
    </div>
    <button
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
      onClick={onContinue}
    >
      Continue
    </button>
  </div>
);

const CurrencySelection = ({ selectedCurrency, onSelectCurrency }) => (
  <div className="space-y-2">
    {['USD', 'EUR', 'GBP', 'JPY'].map((currency) => (
      <div
        key={currency}
        className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center"
        onClick={() => {
          onSelectCurrency(currency);
        }}
      >
        <span className="font-semibold">{currency}</span>
      </div>
    ))}
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div className={`absolute inset-0 bg-white transform transition-transform z-50 duration-300 ease-in-out`}>
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const PaymentMethod = ({ name, providers, isSelected, onClick }) => (
  <div className="flex border border-sm rounded-2xl border-blue-200 items-center py-5 px-6 cursor-pointer" onClick={onClick}>
    <div className="mr-3 ">
      <input
        type="radio"
        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
        checked={isSelected}
        readOnly
      />
    </div>
    <div className="flex-grow">
      <p className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{name}</p>
      <p className="text-xs text-gray-500 mt-0.5">
        Provided by {providers.map((provider, index) => (
          <span key={index} className="inline-flex items-center">
            {index > 0 && " "}
            {provider === 'simplex' && <span className="text-green-500 mr-1">◈</span>}
            {provider === 'wyre' && <span className="text-blue-500 mr-1">⚡</span>}
            {provider === 'sardine' && <span className="mr-1">◇</span>}
            {provider}
          </span>
        ))}
      </p>
    </div>
  </div>
);

export default App;
