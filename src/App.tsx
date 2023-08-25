import { useEffect, useState } from "react";
import "./App.css";
import {
  Client,
  ClientFactory,
  DefaultProviderUrls,
  EOperationStatus,
} from "@massalabs/massa-web3";

function App() {
  const [client, setClient] = useState<Client | null>(null);
  const [opId, setOpId] = useState<string>("");

  async function initClient() {
    const myClient = await ClientFactory.createDefaultClient(
      DefaultProviderUrls.BUILDNET,
      false
    );
    setClient(myClient);
  }

  let isRunning = false;
  let shouldCancel = false;

  async function getStatus() {
    if (isRunning) {
      console.log("getStatus is already running. Cancelling previous run.");
      shouldCancel = true;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a bit to ensure the previous run is cancelled
    }

    isRunning = true;
    shouldCancel = false;

    if (client) {
      const timeout = 60 * 1000;
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        if (shouldCancel) {
          console.log("Cancelling getStatus.");
          break;
        }

        const status = await client.smartContracts().getOperationStatus(opId);
        console.log(EOperationStatus[status]);
        if (status === EOperationStatus.FINAL_SUCCESS) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    isRunning = false;
  }

  useEffect(() => {
    initClient();
  }, []);

  return (
    <>
      <h1>Massa Get Status</h1>
      <p>Operation Id: {opId}</p>
      <input
        type="text"
        value={opId}
        onChange={(e) => setOpId(e.target.value)}
      />
      <button onClick={getStatus}>Get Status</button>
    </>
  );
}

export default App;
