import TopBar from "./TopBar";
import ViewerToolbar from "./ViewerToolbar";
import NewViewer from "./newViewer";
import Sidebar from "./Sidebar";
import NestedDicomTable from "./NestedDicomTable";
import HelloWidget from "./HelloWidget";
import Title from "./Title";
import Paragraph from "./Paragraph";
import InfoBlock from "./InfoBlock";
import JSONEditor from "./JSONEditor";
import Container from "./Container";
import ChartWidget from "./ChartWidget";
import { Button } from "@chakra-ui/react";

export const componentRegistry: Record<string, React.ComponentType<any>> = {
  TopBar,
  ViewerToolbar,
  NewViewer,
  Sidebar,
  NestedDicomTable,
  HelloWidget,
  Title,
  Paragraph,
  InfoBlock,
  JSONEditor,
  Container,
  ChartWidget,
  Button
};
