Instructions:

1. Activate venv (python virtual environment) that already contians the right environment modules used by the python files
    
        myenv\Scripts\activate

If is not already created you have the requirements.txt file that you can use to install the right modules:

        python -m venv myenv

        myenv\Scripts\activate

        python -m pip install -r requirements.txt  
      
2. Launch the python scripts with the activated environment
        
        python backend.py
