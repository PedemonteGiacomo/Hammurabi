#!/usr/bin/env python3
import aws_cdk as cdk

# Import CdkGraph and the "diagram" plugin
from aws_pdk.cdk_graph import CdkGraph, FilterPreset
from aws_pdk.cdk_graph_plugin_diagram import CdkGraphDiagramPlugin

from react_ecs_complete_cdk.react_ecs_complete_cdk_stack import ReactCdkCompleteStack

def main():
    app = cdk.App()

    # 1) Instantiate the existing stack
    ReactCdkCompleteStack(
        app,
        "ReactCdkCompleteStack",
        env=cdk.Environment(account="544547773663", region="us-east-1"),
    )

    # 2) Instantiate CdkGraph passing parameters to the plugin as keyword args
    #
    # - defaults: defines the default values used by all diagrams
    #   (here we force filterPlan = COMPACT, which shows only the core resources
    #    without the low‑level ones)
    # - theme: "dark" theme (change to "light" if you prefer)
    #
    # - diagrams: list of objects, each with a "name" and "title". If you do not
    #   define filterPlan inside a diagram, the one from "defaults" is used.
    graph = CdkGraph(
        app,
        plugins=[
            CdkGraphDiagramPlugin(
                defaults={
                    "filter_plan": {
                        # Using "COMPACT" here
                        "preset": FilterPreset.COMPACT,
                    },
                    # Default theme for diagrams
                    "theme": "dark"
                },
                diagrams=[
                    {
                        # Name of the first (and only) diagram
                        "name": "compact-diagram",
                        "title": "Compact Architecture",
                        # No need to redefine filterPlan and theme, it inherits the defaults
                    }
                ]
            )
        ],
    )

    # 3) CDK synth and diagram generation
    app.synth()
    graph.report()


if __name__ == "__main__":
    main()
