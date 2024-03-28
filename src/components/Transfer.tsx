import { useEffect, useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import {rewardsGetBakerRewardsByCycle, headGet, accountsGetBalance} from "@tzkt/sdk-api";

const getPayoutAmount = async () => {
  const cycle = await headGet().then(res => {return res?.cycle?.valueOf()});
  //console.log(cycle);
  const rewards = await rewardsGetBakerRewardsByCycle("tz1ffYUjwjduZkoquw8ryKRQaUjoWJviFVK6",cycle!).then(res => {return res});
  //console.log(rewards);
  const payoutBalance = await accountsGetBalance("tz1fnU3mjTn8aH2tJ5TcnS5HnfP4wUEhjE7j").then(res => {return res});
  //console.log(payoutBalance);
  var total_est_payout = rewards.futureBlockRewards! + rewards.blockRewards! + rewards.missedBlockRewards! + rewards.blockFees! + rewards.futureEndorsementRewards!;
  //console.log(total_est_payout);
  total_est_payout = total_est_payout - payoutBalance;
  //console.log(total_est_payout);
  return total_est_payout;
}

const Transfer = async  ({
  Tezos,
}: {
  Tezos: TezosToolkit;
}): Promise<JSX.Element> => {
  const [recipient, setRecipient] = useState<string>("tz1fnU3mjTn8aH2tJ5TcnS5HnfP4wUEhjE7j");
  //const [amount, setAmount] = useState<string>("");
  //const [amount, setAmount] = useState<string>(await getPayoutAmount().then(res => {return res.toString}));
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    getPayoutAmount().then(data => setAmount(data.toString()))
  },[])

  const sendTez = async (): Promise<void> => {
    if (recipient && amount) {
      setLoading(true);
      try {
        const op = await Tezos.wallet
          .transfer({ to: recipient, amount: parseInt(amount), mutez: true })
          .send();
        await op.confirmation();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="transfer-inputs">
      Recipient: <input
        type="text"
        placeholder="Recipient"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
      />
      <br />
      Amount in uTez:<input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <br />
      <button
        className="button"
        disabled={!recipient && !amount}
        onClick={sendTez}
      >
        {loading ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Sending...
          </span>
        ) : (
          <span>
            <i className="far fa-paper-plane"></i>&nbsp; Send
          </span>
        )}
      </button>
    </div>
  );
};

export default Transfer;