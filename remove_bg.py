from PIL import Image
import sys

def remove_background(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # Remove black background
    for item in datas:
        # Check if the pixel is close to black
        if item[0] < tolerance and item[1] < tolerance and item[2] < tolerance:
            newData.append((0, 0, 0, 0)) # Fully transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent logo to {output_path}")

if __name__ == "__main__":
    remove_background(sys.argv[1], sys.argv[2])
