FROM python:3.9

#copy model to avoid unnecessary download

COPY u2net.onnx /home/.u2net/u2net.onnx

COPY requirements.txt .

RUN pip install  --no-cache-dir -r requirements.txt


COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
