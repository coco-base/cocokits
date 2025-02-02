import { ForDesigners } from "../src/components/home/for-users/for-designer";
import { ForDevelopers } from "../src/components/home/for-users/for-developers";
import { Frameworks } from "../src/components/home/frameworks/frameworks";
import { InsideCocoKits } from "../src/components/home/inside-cocokits/inside-cocokits";
import { UiComponents } from "../src/components/home/ui-components/ui-components";
import { Welcome } from "../src/components/home/welcome/welcome";

export default function Index() {
  return (
    <>
      <Welcome />
      <InsideCocoKits />
      <Frameworks />
      <ForDesigners />
      <ForDevelopers />
      <UiComponents />
    </>
  );
}
