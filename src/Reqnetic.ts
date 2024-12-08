import { OrderPayload } from "./OrderPayload";
import { localUrl } from "./urls";
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
      console.log("1");
      this.removeLoading();
      return;
      response = await fetch((localUrl as string) + "/api/v1/sdk/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.api_key}`,
        },
        body: JSON.stringify(data),
      });

      const resp = await response.json();
      console.log("2");
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network/",
        },
      });
      console.log("3");

      const requestData = resp.request_data;
      console.log("4");
      const provider = new providers.Web3Provider((window as any).ethereum);
      console.log("5");
      console.log({ provider });
      try {
        await provider.send("wallet_switchEthereumChain", [
          { chainId: "0xaa36a7" },
        ]);
        console.log("6");
      } catch (error) {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: {
              name: "Sepolia",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              `https://sepolia.infura.io/v3/53163c736f1d4ba78f0a39ffda8d87b4`,
            ],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ]);

        await provider.send("wallet_switchEthereumChain", [
          { chainId: "0xaa36a7" },
        ]);
      }

      console.log("7");

      const paymentTx = await payRequest(requestData, provider.getSigner());
      console.log("8");
      await paymentTx.wait();
      console.log("9");

      await requestClient.persistRequest(resp.request);

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
