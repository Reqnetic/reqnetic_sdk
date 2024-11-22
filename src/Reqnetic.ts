import { OrderPayload } from "./OrderPayload";
import { localUrl } from "./urls";
import { Types, Utils } from "@requestnetwork/request-client.js";
import { EthereumPrivateKeySignatureProvider } from "@requestnetwork/epk-signature";
import { providers } from "ethers";
import { RequestNetwork } from "@requestnetwork/request-client.js";
import { payRequest } from "@requestnetwork/payment-processor";

export class Reqnetic {
  public api_key: string;
  static setup(api_key: string) {
    return new Reqnetic(api_key);
  }
  constructor(api_key: string) {
    this.api_key = api_key;
  }

  public initializePayment = async (data: OrderPayload) => {
    this.displayLoading();
    let response;
    try {
      response = await fetch((localUrl as string) + "/api/v1/sdk/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.api_key}`,
        },
        body: JSON.stringify(data),
      });

      const resp = await response.json();

      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network/",
        },
      });

      const request = await requestClient.fromRequestId(resp.request_id);

      const requestData = request.inMemoryInfo!.requestData;

      const provider = new providers.Web3Provider((window as any).ethereum); //TODO: fix this
      // switch to correct network
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x1" }]);

      const paymentTx = await payRequest(requestData, provider.getSigner());
      await paymentTx.wait();

      // Step 5: Persist transaction

      // We have to create a new Request Network Instance that can persist the request.
      const requestNetworkWithPersistence = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network",
        },
      });

      await requestNetworkWithPersistence.persistRequest(requestData);

      this.removeLoading();
      return resp.url;
    } catch (error) {
      console.log(error);
      this.removeLoading();
    }
  };

  private displayLoading() {
    const html = `<div class="half-circle-spinner">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>`;
    const css = `.half-circle-spinner, .half-circle-spinner * {
        box-sizing: border-box;
      }
  
      .half-circle-spinner {
        width: 60px;
        height: 60px;
        border-radius: 100%;
        position: relative;
      }
  
      .half-circle-spinner .circle {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 100%;
        border: calc(60px / 10) solid transparent;
      }
  
      .half-circle-spinner .circle.circle-1 {
        border-top-color: #ff1d5e;
        animation: half-circle-spinner-animation 1s infinite;
      }
  
      .half-circle-spinner .circle.circle-2 {
        border-bottom-color: #ff1d5e;
        animation: half-circle-spinner-animation 1s infinite alternate;
      }
  
      @keyframes half-circle-spinner-animation {
        0% {
          transform: rotate(0deg);
  
        }
        100%{
          transform: rotate(360deg);
        }
      }`;
    //   append css to head
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);

    //   append html to body
    const div = document.createElement("div");
    div.id = "Reqnetic-loading";
    //   let it be in the middle of the page
    div.style.position = "absolute";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.innerHTML = html;
    document.body.appendChild(div);

    //   add an overlay
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.id = "Reqnetic-overlay";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = "999";
    document.body.appendChild(overlay);
  }

  private removeLoading() {
    const loading = document.querySelector("#Reqnetic-loading");
    const overlay = document.querySelector("#Reqnetic-overlay");
    if (loading) {
      loading.remove();
    }
    if (overlay) {
      overlay.remove();
    }
  }
}
