#!/usr/bin/env python3
import aws_cdk as cdk

# Import del CdkGraph e del plugin "diagram"
from aws_pdk.cdk_graph import CdkGraph, FilterPreset
from aws_pdk.cdk_graph_plugin_diagram import CdkGraphDiagramPlugin

from react_ecs_complete_cdk.react_ecs_complete_cdk_stack import ReactCdkCompleteStack

def main():
    app = cdk.App()

    # 1) Istanzia lo stack (già esistente)
    ReactCdkCompleteStack(
        app,
        "ReactCdkCompleteStack",
        env=cdk.Environment(account="544547773663", region="us-east-1"),
    )

    # 2) Istanzia CdkGraph passando i parametri al plugin come keyword args
    #
    # - defaults: definisce i valori di default usati da tutti i diagrammi
    #   (qui forziamo il filterPlan = COMPACT, cioè mostra solo le risorse "core"
    #    senza quelle di basso livello)
    # - theme: tema "dark" (puoi cambiare in "light" se preferisci)
    #
    # - diagrams: lista di oggetti, ognuno con un "name" e un "title". Se non
    #   definisci filterPlan all'interno di un singolo diagramma, verrà usato
    #   quello definito in "defaults".
    graph = CdkGraph(
        app,
        plugins=[
            CdkGraphDiagramPlugin(
                defaults={
                    "filter_plan": {
                        # Qui usiamo "COMPACT"
                        "preset": FilterPreset.COMPACT,
                    },
                    # Tema di default per i diagrammi
                    "theme": "dark"
                },
                diagrams=[
                    {
                        # Nome del primo (e unico) diagramma
                        "name": "compact-diagram",
                        "title": "Architettura Compatta",
                        # Non serve ridefinire filterPlan e theme, perché eredita le defaults
                    }
                ]
            )
        ],
    )

    # 3) Synth di CDK e generazione del (o dei) diagramma(i)
    app.synth()
    graph.report()


if __name__ == "__main__":
    main()
