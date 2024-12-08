import tkinter as tk
from PIL import Image, ImageTk
import qrcode

def generate_qr():
    data = entry.get("1.0", "end-1c")  # Get data from entry widget
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white")
    qr_image.save("qrcode.png")  # Save the generated QR code
    show_qr_code()

def show_qr_code():
    qr_image = Image.open("qrcode.png")
    qr_image.thumbnail((300, 300))  
    qr_img = ImageTk.PhotoImage(qr_image)
    qr_label.config(image=qr_img)
    qr_label.image = qr_img  # Keep a reference to prevent garbage collection

root = tk.Tk()
root.title("QR Code Generator")

entry = tk.Text(root, font=('Arial', 14), height=4, width=40)
entry.pack(pady=10)

generate_button = tk.Button(root, text="Generate QR Code", command=generate_qr)
generate_button.pack(pady=5)

qr_label = tk.Label(root)
qr_label.pack(pady=10)

root.mainloop()