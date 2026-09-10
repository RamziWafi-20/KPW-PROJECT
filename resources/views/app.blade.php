<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0077B6">
    <title>STORA — Store & Receiving Management System</title>
    <script>
        window.tailwind = window.tailwind || {};
        window.tailwind.config = { darkMode: 'class' };
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('stora.css') }}">
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@19.0.0",
        "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
        "react-dom/client": "https://esm.sh/react-dom@19.0.0/client",
        "lucide-react": "https://esm.sh/lucide-react@0.546.0?deps=react@19.0.0",
        "chart.js": "https://esm.sh/chart.js@4.5.1",
        "react-chartjs-2": "https://esm.sh/react-chartjs-2@5.3.1?deps=react@19.0.0,chart.js@4.5.1",
        "jspdf": "https://esm.sh/jspdf@4.2.1",
        "jspdf-autotable": "https://esm.sh/jspdf-autotable@5.0.8?deps=jspdf@4.2.1"
      }
    }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="{{ asset('react/main.js') }}"></script>
</body>
</html>
