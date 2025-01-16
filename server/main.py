from flask import Flask, request, send_file, jsonify
import io
import matplotlib
matplotlib.use('Agg') #NO REQUIERE DE INTERFAZ GRÁFICA. IDEAL PARA SERVIDORES
import matplotlib.pyplot as plt
import numpy as np
from Simplex import plot_static
from flask_cors import CORS
import time
from scipy.integrate import solve_ivp
import os

app = Flask(__name__)

CORS(app) 

x0 = [0.7,0.2,0.1] 
np_matrix = np.eye(3)
y = np.empty(3)
t = np.linspace(0, 50, 1000)

def serieTiempo(np_matrix, x0):
    A = np.copy(np_matrix)
    def replicator(t, x):
        f_ = np.dot(x, A @ x)
        dx1dt = x[0]*((A @ x)[0] - f_)
        dx2dt = x[1]*((A @ x)[1] - f_)
        dx3dt = x[2]*((A @ x)[2] - f_)
        return [dx1dt, dx2dt, dx3dt]
    linear_ode_solution = solve_ivp(replicator, (0, 50), x0, t_eval=t)
    y = linear_ode_solution.y
    return y


@app.route('/generate-graph', methods=['POST'])
def generate_graph():
    global x0 
    global np_matrix
    global y
    # Obtener la matriz enviada desde el frontend

    data = request.get_json()
    matrix = data.get('matrix')
    
    # Convertir la lista de listas en un array de NumPy
    np_matrix = np.array(matrix)

    #Cambiar la serie de tiempo
    y = serieTiempo(np_matrix,x0)

    # Crear un gráfico usando Matplotlib

    def get_payoff(a,b,c,d,e,f,g,h,k):
        return [[a, b, c], 
                [d, e, f], 
                [g, h, k]]
    
    parameter_values = [[np_matrix[0][0]],[np_matrix[0][1]],[np_matrix[0][2]],
                        [np_matrix[1][0]],[np_matrix[1][1]],[np_matrix[1][2]],
                        [np_matrix[2][0]],[np_matrix[2][1]],[np_matrix[2][2]] ]
    
    labels = ['$x_1$', '$x_2$', '$x_3$']
    
    simplex = plot_static(parameter_values, custom_func=get_payoff, vert_labels=labels, display_parameters=False, paths=False, path_color="gray",ic_type="grid")

    # Guardar la imagen del gráfico en un objeto en memoria
    img_io = io.BytesIO()
    plt.savefig(img_io, format='PNG', bbox_inches='tight')
    img_io.seek(0)  # Reposicionar el puntero al inicio del archivo en memoria

    # Devolver la imagen como una respuesta
    return send_file(img_io, mimetype='image/png')

@app.route('/plot_time', methods=['GET'])
def plot_time():
    global y 

    return jsonify(y.tolist())

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8081))
    app.run(debug=True, port=port)
