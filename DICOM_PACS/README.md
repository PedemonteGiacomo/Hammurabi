Instructions:

0. Activate venv (python virtual environment) that already contians the right environment modules used by the python files when you are in the root (DICOM_PACS)
    
        myenv\Scripts\activate

Then in this case to run the pacs use:

1. Run the PACS
        
        cd PACS_SERVER
        python PACS.py

2. Apri un nuovo terminale

        esegui passo 0. (attivare venv)

3. dal nuovo terminale SENDERS to send the images to the pacs, per prima cosa avvia il sender

        cd SENDERS

        python sender_client.py 

        per mandare le immagini contenute nella cartella "dicom_images" (50), associate a utente 100_HM10395

        python DICOM_images_generator_client.py 

        questo manda immagini create random, associate a utente TEST001

4. Queste immagini devono essere arrivate nel terminale del DICOM PACS SERVER