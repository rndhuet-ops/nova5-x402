paths: {
  "/wallet": {
    get: {
      summary: "Base wallet intelligence",
      description:
        "Returns live USDC balance, ETH balance, block, timestamp and gas for a Base wallet.",
      parameters: [
        {
          name: "address",
          in: "query",
          required: true,
          schema: {
            type: "string",
          },
          description: "EVM wallet address",
        },
      ],

      "x-payment-info": {
        protocols: ["x402"],
        price: {
          mode: "fixed",
          currency: "USD",
          amount: "0.001",
        },
      },

      responses: {
        "200": {
          description: "Wallet intelligence response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  usdc_balance: { type: "number" },
                  native_balance: { type: "number" },
                  block_number: { type: "number" },
                  block_timestamp: { type: "number" },
                  gas_price_wei: { type: "string" },
                  gas_price_gwei: { type: "number" },
                  provenance: { type: "string" },
                },
              },
            },
          },
        },
        "402": {
          description: "Payment Required",
        },
      },
    },
  },

  "/wallet-decision": {
    get: {
      summary: "Wallet Decision",
      description:
        "Returns a machine-ready wallet verdict with balances, gas context, risk score and SAFE / CAUTION / RISKY decision.",
      parameters: [
        {
          name: "address",
          in: "query",
          required: true,
          schema: {
            type: "string",
          },
          description: "EVM wallet address",
        },
      ],

      "x-payment-info": {
        protocols: ["x402"],
        price: {
          mode: "fixed",
          currency: "USD",
          amount: "0.01",
        },
      },

      responses: {
        "200": {
          description: "Wallet decision response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  usdc_balance: { type: "number" },
                  native_balance: { type: "number" },
                  gas_price_gwei: { type: "number" },
                  risk_score: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                  },
                  verdict: {
                    type: "string",
                    enum: ["SAFE", "CAUTION", "RISKY"],
                  },
                  reasons: {
                    type: "array",
                    items: { type: "string" },
                  },
                  provenance: { type: "string" },
                },
              },
            },
          },
        },
        "402": {
          description: "Payment Required",
        },
      },
    },
  },
},
