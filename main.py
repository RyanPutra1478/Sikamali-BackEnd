import os
import argparse
from pathlib import Path

def generate_tree(dir_path, prefix="", ignore_list=None):
    """
    Fungsi rekursif untuk mencetak struktur folder dan file.
    """
    if ignore_list is None:
        # Daftar folder/file yang ingin diabaikan agar output tidak terlalu panjang
        ignore_list = ['.git', '__pycache__', 'node_modules', '.DS_Store', 'dist', 'build']

    # Pastikan path adalah objek Path
    root = Path(dir_path)
    
    # Cek apakah folder ada
    if not root.exists():
        return f"Error: Path '{dir_path}' tidak ditemukan."
    if not root.is_dir():
        return f"Error: '{dir_path}' bukan sebuah folder."

    output_lines = []
    
    try:
        # Ambil semua item dalam folder, filter yang ada di ignore_list, lalu urutkan
        # Mengurutkan agar folder dan file bercampur secara alfabetis (seperti contoh Anda)
        items = sorted(
            [item for item in root.iterdir() if item.name not in ignore_list],
            key=lambda x: (x.is_file(), x.name.lower()) # Folder dulu, baru file (opsional), atau hapus key ini untuk alfabet murni
        )
        
        # Opsi: Jika ingin alfabet murni tanpa memisahkan folder/file, gunakan:
        # key=lambda x: x.name.lower()
        
    except PermissionError:
        return [f"{prefix}└── [Akses Ditolak]"]

    total_items = len(items)
    
    for i, item in enumerate(items):
        is_last = (i == total_items - 1)
        
        # Tentukan konektor grafis
        if is_last:
            connector = "└── "
            new_prefix = prefix + "    "
        else:
            connector = "├── "
            new_prefix = prefix + "│   "
            
        # Tambahkan slash di belakang nama jika itu folder
        display_name = item.name + ("/" if item.is_dir() else "")
        
        # Tambahkan baris ke output
        output_lines.append(f"{prefix}{connector}{display_name}")
        
        # Jika item adalah folder, lakukan rekursi (panggil fungsi ini lagi)
        if item.is_dir():
            # Rekursi dan gabungkan hasilnya
            subdir_lines = generate_tree(item, new_prefix, ignore_list)
            if isinstance(subdir_lines, list):
                output_lines.extend(subdir_lines)
    
    return output_lines

def main():
    # Setup argumen baris perintah
    parser = argparse.ArgumentParser(description="Generate text-based directory tree.")
    parser.add_argument("path", nargs="?", default=".", help="Path folder yang ingin dipetakan (default: folder saat ini)")
    parser.add_argument("-o", "--output", help="Simpan output ke file teks (opsional)")
    
    args = parser.parse_args()
    
    target_path = args.path
    print(f"Memetakan: {os.path.abspath(target_path)}\n")
    print(f"{os.path.basename(os.path.abspath(target_path))}/")
    
    # Generate tree
    tree_lines = generate_tree(target_path)
    
    if isinstance(tree_lines, str):
        # Jika terjadi error
        print(tree_lines)
    else:
        # Gabungkan hasil
        full_text = "\n".join(tree_lines)
        
        # Tampilkan di layar
        print(full_text)
        
        # Simpan ke file jika diminta
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(f"{target_path}/\n")
                f.write(full_text)
            print(f"\n[Sukses] Struktur pohon disimpan ke: {args.output}")

if __name__ == "__main__":
    main()